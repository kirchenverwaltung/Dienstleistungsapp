import React, { useState, useEffect } from "react";
import { BusinessRegistration } from "@/entities/BusinessRegistration";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Upload, FileText, AlertCircle, Download } from "lucide-react";
import { motion } from "framer-motion";
import { UploadFile } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BusinessVerificationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    has_business: null,
    needs_help: null,
    form_data: {
      first_name: "",
      last_name: "",
      birth_date: "",
      birth_place: "",
      address: "",
      city: "",
      postal_code: "",
      business_description: "",
      start_date: ""
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (currentUser.business_verified) {
        navigate(createPageUrl("Home"));
        return;
      }

      const existingRegistration = await BusinessRegistration.filter({ 
        user_email: currentUser.email 
      });

      if (existingRegistration.length > 0) {
        setRegistration(existingRegistration[0]);
        setFormData({
          has_business: existingRegistration[0].has_business,
          needs_help: existingRegistration[0].needs_help,
          form_data: existingRegistration[0].form_data || formData.form_data
        });
      }
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      if (registration) {
        await BusinessRegistration.update(registration.id, {
          business_proof_url: file_url,
          status: "wird_geprüft"
        });
      } else {
        await BusinessRegistration.create({
          user_email: user.email,
          user_name: user.full_name,
          has_business: true,
          business_proof_url: file_url,
          status: "wird_geprüft"
        });
      }

      await loadData();
    } catch (error) {
      console.error("Upload-Fehler:", error);
    }
    setIsUploading(false);
  };

  const handleSubmitChoice = async (hasBusiness) => {
    setIsSaving(true);
    try {
      if (registration) {
        await BusinessRegistration.update(registration.id, {
          has_business: hasBusiness
        });
      } else {
        await BusinessRegistration.create({
          user_email: user.email,
          user_name: user.full_name,
          has_business: hasBusiness,
          status: "eingereicht"
        });
      }

      if (hasBusiness) {
        setStep(2);
      } else {
        setStep(3);
      }
      setFormData({...formData, has_business: hasBusiness});
      await loadData();
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const handleSubmitHelpChoice = async (needsHelp) => {
    setIsSaving(true);
    try {
      await BusinessRegistration.update(registration.id, {
        needs_help: needsHelp
      });

      if (needsHelp) {
        setStep(4);
      } else {
        alert("Bitte melden Sie Ihr Gewerbe selbst an und laden Sie dann den Nachweis hoch.");
        navigate(createPageUrl("Profile"));
      }
      setFormData({...formData, needs_help: needsHelp});
      await loadData();
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await BusinessRegistration.update(registration.id, {
        form_data: formData.form_data,
        status: "dokument_angefordert"
      });

      await loadData();
      setStep(5);
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const handleSignedDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      await BusinessRegistration.update(registration.id, {
        signed_document_url: file_url,
        status: "an_behörde_gesendet"
      });

      await loadData();
    } catch (error) {
      console.error("Upload-Fehler:", error);
    }
    setIsUploading(false);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      eingereicht: { text: "Eingereicht", color: "bg-blue-100 text-blue-800", icon: Clock },
      wird_geprüft: { text: "Wird geprüft", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      dokument_angefordert: { text: "Dokument angefordert", color: "bg-purple-100 text-purple-800", icon: FileText },
      an_behörde_gesendet: { text: "An Behörde gesendet", color: "bg-indigo-100 text-indigo-800", icon: Clock },
      bei_behörde: { text: "Bei Behörde", color: "bg-orange-100 text-orange-800", icon: Clock },
      genehmigt: { text: "Genehmigt", color: "bg-green-100 text-green-800", icon: CheckCircle },
      abgelehnt: { text: "Abgelehnt", color: "bg-red-100 text-red-800", icon: AlertCircle }
    };
    return statusMap[status] || statusMap.eingereicht;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (registration && (registration.status === "wird_geprüft" || registration.status === "an_behörde_gesendet" || registration.status === "bei_behörde")) {
    const statusInfo = getStatusInfo(registration.status);
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <statusInfo.icon className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Gewerbeanmeldung läuft
              </h2>
              <Badge className={`${statusInfo.color} text-lg px-6 py-2 mb-6`}>
                {statusInfo.text}
              </Badge>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Ihre Gewerbeanmeldung wird bearbeitet. Sie werden benachrichtigt, sobald der Prozess abgeschlossen ist.
              </p>
              {registration.admin_notes && (
                <div className="bg-blue-50 rounded-xl p-6 text-left">
                  <div className="font-semibold text-gray-900 mb-2">Hinweis vom Team:</div>
                  <p className="text-gray-700">{registration.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl">Gewerbe-Verifizierung</CardTitle>
              <p className="text-gray-600">
                Um als Jobsuchender Jobs annehmen zu können, benötigen Sie ein Gewerbe
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      Warum benötige ich ein Gewerbe?
                    </h3>
                    <p className="text-gray-700">
                      In Deutschland müssen Personen, die selbstständig arbeiten, ein Gewerbe anmelden. 
                      Dies ist gesetzlich vorgeschrieben und schützt sowohl Sie als auch Ihre Auftraggeber.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-4">
                      Haben Sie bereits ein Gewerbe angemeldet?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        size="lg"
                        className="h-auto py-6 bg-green-600 hover:bg-green-700"
                        onClick={() => handleSubmitChoice(true)}
                        disabled={isSaving}
                      >
                        <CheckCircle className="w-6 h-6 mr-2" />
                        <div className="text-left">
                          <div className="font-bold">Ja, ich habe ein Gewerbe</div>
                          <div className="text-sm opacity-90">Nachweis hochladen</div>
                        </div>
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="h-auto py-6"
                        onClick={() => handleSubmitChoice(false)}
                        disabled={isSaving}
                      >
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <div className="text-left">
                          <div className="font-bold">Nein, noch nicht</div>
                          <div className="text-sm">Hilfe bei der Anmeldung</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Gewerbeschein hochladen
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Bitte laden Sie ein Foto oder Scan Ihres Gewerbescheins hoch
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      id="business-proof"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="business-proof"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-lg font-medium text-gray-700 mb-2">
                        {isUploading ? "Wird hochgeladen..." : "Datei auswählen"}
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG oder PDF (max. 10MB)
                      </span>
                    </label>
                  </div>

                  {registration?.business_proof_url && (
                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-green-900">Dokument hochgeladen</div>
                        <div className="text-sm text-green-700">Wird von unserem Team geprüft</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Benötigen Sie Hilfe bei der Gewerbeanmeldung?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Wir können Sie durch den Prozess begleiten
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="h-auto py-6 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleSubmitHelpChoice(true)}
                      disabled={isSaving}
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <div className="text-left">
                        <div className="font-bold">Ja, ich brauche Hilfe</div>
                        <div className="text-sm opacity-90">Formular ausfüllen</div>
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="h-auto py-6"
                      onClick={() => handleSubmitHelpChoice(false)}
                      disabled={isSaving}
                    >
                      <div className="text-left">
                        <div className="font-bold">Nein, ich melde es selbst an</div>
                        <div className="text-sm">Nachweis später hochladen</div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Gewerbeanmeldungs-Formular
                  </h3>
                  <p className="text-gray-600">
                    Füllen Sie die folgenden Felder aus. Wir erstellen daraus ein Dokument, 
                    das Sie ausdrucken und unterschreiben müssen.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Vorname *</Label>
                      <Input
                        id="first_name"
                        required
                        value={formData.form_data.first_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, first_name: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nachname *</Label>
                      <Input
                        id="last_name"
                        required
                        value={formData.form_data.last_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, last_name: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Geburtsdatum *</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        required
                        value={formData.form_data.birth_date}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, birth_date: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_place">Geburtsort *</Label>
                      <Input
                        id="birth_place"
                        required
                        value={formData.form_data.birth_place}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, birth_place: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.form_data.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        form_data: {...formData.form_data, address: e.target.value}
                      })}
                      placeholder="Straße und Hausnummer"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postleitzahl *</Label>
                      <Input
                        id="postal_code"
                        required
                        value={formData.form_data.postal_code}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, postal_code: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Stadt *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.form_data.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          form_data: {...formData.form_data, city: e.target.value}
                        })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_description">Beschreibung der Tätigkeit *</Label>
                    <Textarea
                      id="business_description"
                      required
                      value={formData.form_data.business_description}
                      onChange={(e) => setFormData({
                        ...formData,
                        form_data: {...formData.form_data, business_description: e.target.value}
                      })}
                      placeholder="z.B. Dienstleistungen in Gastronomie und Event-Service"
                      className="rounded-xl h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Gewünschtes Startdatum *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      value={formData.form_data.start_date}
                      onChange={(e) => setFormData({
                        ...formData,
                        form_data: {...formData.form_data, start_date: e.target.value}
                      })}
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSaving ? "Wird gespeichert..." : "Formular absenden"}
                  </Button>
                </form>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Formular erhalten!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Bitte drucken Sie das Formular aus, unterschreiben Sie es und laden Sie es wieder hoch
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                    <h4 className="font-bold text-gray-900">Nächste Schritte:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Formular herunterladen und ausdrucken</li>
                      <li>Mit Ihrer Unterschrift versehen</li>
                      <li>Eingescanntes oder fotografiertes Dokument hochladen</li>
                      <li>Wir senden es an die zuständige Behörde</li>
                    </ol>
                  </div>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Formular herunterladen
                  </Button>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      id="signed-document"
                      accept="image/*,.pdf"
                      onChange={handleSignedDocumentUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="signed-document"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-lg font-medium text-gray-700 mb-2">
                        {isUploading ? "Wird hochgeladen..." : "Unterschriebenes Dokument hochladen"}
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG oder PDF (max. 10MB)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}