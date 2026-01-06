import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

const statusColors = {
  eingereicht: "bg-blue-100 text-blue-800 border-blue-200",
  wird_geprüft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  dokument_angefordert: "bg-purple-100 text-purple-800 border-purple-200",
  an_behörde_gesendet: "bg-indigo-100 text-indigo-800 border-indigo-200",
  bei_behörde: "bg-orange-100 text-orange-800 border-orange-200",
  genehmigt: "bg-green-100 text-green-800 border-green-200",
  abgelehnt: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  eingereicht: "Eingereicht",
  wird_geprüft: "Wird geprüft",
  dokument_angefordert: "Dokument angefordert",
  an_behörde_gesendet: "An Behörde gesendet",
  bei_behörde: "Bei Behörde",
  genehmigt: "Genehmigt",
  abgelehnt: "Abgelehnt"
};

export default function AdminBusinessRegistrationsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("alle");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const loadData = React.useCallback(async () => {
    const allRegistrations = await BusinessRegistration.list("-created_date");
    setRegistrations(allRegistrations);
    setFilteredRegistrations(allRegistrations);
  }, []);

  const checkAdminAndLoadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      if (user.role !== "admin") {
        navigate(createPageUrl("Home"));
        return;
      }

      await loadData();
    } catch (error) {
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  }, [navigate, loadData]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  useEffect(() => {
    if (filterStatus === "alle") {
      setFilteredRegistrations(registrations);
    } else {
      setFilteredRegistrations(registrations.filter(r => r.status === filterStatus));
    }
  }, [filterStatus, registrations]);

  const handleStatusChange = async (registrationId, newStatus) => {
    setIsSaving(true);
    try {
      await BusinessRegistration.update(registrationId, { status: newStatus });
      
      // Wenn genehmigt, User als verifiziert markieren
      if (newStatus === "genehmigt") {
        const registration = registrations.find(r => r.id === registrationId);
        if (registration) {
          const users = await User.filter({ email: registration.user_email });
          if (users.length > 0) {
            await User.update(users[0].id, { business_verified: true });
          }
        }
      }
      
      await loadData();
      setSelectedRegistration(null);
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const handleApprove = async (registrationId) => {
    await handleStatusChange(registrationId, "genehmigt");
  };

  const handleReject = async (registrationId) => {
    if (!rejectionReason.trim()) {
      alert("Bitte geben Sie einen Ablehnungsgrund an");
      return;
    }
    
    setIsSaving(true);
    try {
      await BusinessRegistration.update(registrationId, {
        status: "abgelehnt",
        rejection_reason: rejectionReason
      });
      await loadData();
      setSelectedRegistration(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const handleSaveNotes = async (registrationId) => {
    setIsSaving(true);
    try {
      await BusinessRegistration.update(registrationId, {
        admin_notes: adminNotes
      });
      await loadData();
      alert("Notizen gespeichert");
    } catch (error) {
      console.error("Fehler:", error);
    }
    setIsSaving(false);
  };

  const viewRegistration = (registration) => {
    setSelectedRegistration(registration);
    setAdminNotes(registration.admin_notes || "");
    setRejectionReason(registration.rejection_reason || "");
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === "wird_geprüft" || r.status === "eingereicht").length,
    approved: registrations.filter(r => r.status === "genehmigt").length,
    rejected: registrations.filter(r => r.status === "abgelehnt").length
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
        <motion.div
          className={`w-12 h-12 border-3 rounded-full ${isDark ? 'border-gray-800 border-t-green-500' : 'border-gray-200 border-t-green-500'}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f8faf8]'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gewerbe-Anmeldungen verwalten
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Prüfen und verwalten Sie eingereichte Gewerbe-Anmeldungen</p>
        </div>

        {/* Statistiken */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`border shadow-lg ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div className={`text-sm mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Gesamt</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`border shadow-lg ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className={`text-sm mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ausstehend</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className={`border shadow-lg ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className={`text-sm mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Genehmigt</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.approved}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={`border shadow-lg ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className={`text-sm mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Abgelehnt</div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.rejected}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filter */}
        <Card className={`border shadow-lg mb-8 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Status filtern:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className={`w-64 rounded-xl ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
                  <SelectItem value="alle" className={isDark ? 'text-white' : 'text-gray-900'}>Alle Anträge</SelectItem>
                  <SelectItem value="eingereicht" className={isDark ? 'text-white' : 'text-gray-900'}>Eingereicht</SelectItem>
                  <SelectItem value="wird_geprüft" className={isDark ? 'text-white' : 'text-gray-900'}>Wird geprüft</SelectItem>
                  <SelectItem value="dokument_angefordert" className={isDark ? 'text-white' : 'text-gray-900'}>Dokument angefordert</SelectItem>
                  <SelectItem value="an_behörde_gesendet" className={isDark ? 'text-white' : 'text-gray-900'}>An Behörde gesendet</SelectItem>
                  <SelectItem value="bei_behörde" className={isDark ? 'text-white' : 'text-gray-900'}>Bei Behörde</SelectItem>
                  <SelectItem value="genehmigt" className={isDark ? 'text-white' : 'text-gray-900'}>Genehmigt</SelectItem>
                  <SelectItem value="abgelehnt" className={isDark ? 'text-white' : 'text-gray-900'}>Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {filteredRegistrations.length} Antrag/Anträge
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste der Anträge */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRegistrations.map((registration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border shadow-lg hover:shadow-xl transition-shadow duration-300 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <UserIcon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{registration.user_name}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{registration.user_email}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className="text-sm">
                              Eingereicht: {format(new Date(registration.created_date), "d. MMM yyyy, HH:mm", { locale: de })}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Building2 className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className="text-sm">
                              {registration.has_business ? "Hat Gewerbe" : "Braucht Hilfe"}
                            </span>
                          </div>
                        </div>

                        <Badge className={`${statusColors[registration.status]} border`}>
                          {statusLabels[registration.status]}
                        </Badge>
                      </div>

                      <Button
                        onClick={() => viewRegistration(registration)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRegistrations.length === 0 && (
            <Card className={`border shadow-lg ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
              <CardContent className="p-12 text-center">
                <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Keine Anträge gefunden
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Es gibt keine Anträge mit dem ausgewählten Status
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail-Dialog */}
      <Dialog open={selectedRegistration !== null} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {selectedRegistration && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Gewerbe-Anmeldung Details</DialogTitle>
                <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Antrag von {selectedRegistration.user_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status & Grundinfo */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</div>
                      <Badge className={`${statusColors[selectedRegistration.status]} border text-base px-4 py-2`}>
                        {statusLabels[selectedRegistration.status]}
                      </Badge>
                    </div>
                    <div>
                      <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Eingereicht am</div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {format(new Date(selectedRegistration.created_date), "d. MMMM yyyy, HH:mm", { locale: de })} Uhr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kontaktdaten */}
                <div>
                  <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Kontaktdaten</h3>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Mail className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span>{selectedRegistration.user_email}</span>
                    </div>
                  </div>
                </div>

                {/* Gewerbe-Status */}
                <div>
                  <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Gewerbe-Status</h3>
                  <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <div className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedRegistration.has_business ? "✓ Hat bereits ein Gewerbe" : "✗ Hat noch kein Gewerbe"}
                    </div>
                    {!selectedRegistration.has_business && (
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedRegistration.needs_help ? "Braucht Hilfe bei der Anmeldung" : "Meldet selbst an"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hochgeladene Dokumente */}
                {selectedRegistration.business_proof_url && (
                  <div>
                    <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Gewerbeschein</h3>
                    <div className={`border-2 rounded-xl p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <Button
                        onClick={() => {
                          setSelectedImage(selectedRegistration.business_proof_url);
                          setShowImageDialog(true);
                        }}
                        variant="outline"
                        className={`w-full ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : ''}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Gewerbeschein anzeigen
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRegistration.signed_document_url && (
                  <div>
                    <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Unterschriebenes Dokument</h3>
                    <div className={`border-2 rounded-xl p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <Button
                        onClick={() => {
                          setSelectedImage(selectedRegistration.signed_document_url);
                          setShowImageDialog(true);
                        }}
                        variant="outline"
                        className={`w-full ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : ''}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Dokument anzeigen
                      </Button>
                    </div>
                  </div>
                )}

                {/* Formulardaten */}
                {selectedRegistration.form_data && (
                  <div>
                    <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ausgefüllte Formulardaten</h3>
                    <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Vorname</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.first_name || "-"}</div>
                        </div>
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nachname</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.last_name || "-"}</div>
                        </div>
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Geburtsdatum</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.birth_date || "-"}</div>
                        </div>
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Geburtsort</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.birth_place || "-"}</div>
                        </div>
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Adresse</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.address || "-"}</div>
                        </div>
                        <div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>PLZ & Stadt</div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedRegistration.form_data.postal_code || "-"} {selectedRegistration.form_data.city || "-"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tätigkeitsbeschreibung</div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.business_description || "-"}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gewünschtes Startdatum</div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRegistration.form_data.start_date || "-"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin-Notizen */}
                <div>
                  <Label htmlFor="admin_notes" className={`font-bold text-lg mb-3 block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Admin-Notizen
                  </Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className={`rounded-xl h-24 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    placeholder="Interne Notizen hinzufügen..."
                  />
                  <Button
                    onClick={() => handleSaveNotes(selectedRegistration.id)}
                    disabled={isSaving}
                    variant="outline"
                    className={`mt-2 ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : ''}`}
                  >
                    Notizen speichern
                  </Button>
                </div>

                {/* Ablehnungsgrund (wenn abgelehnt) */}
                {selectedRegistration.status === "abgelehnt" && selectedRegistration.rejection_reason && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="font-bold text-red-900 mb-2">Ablehnungsgrund:</div>
                    <p className="text-red-800">{selectedRegistration.rejection_reason}</p>
                  </div>
                )}

                {/* Status ändern */}
                {selectedRegistration.status !== "genehmigt" && selectedRegistration.status !== "abgelehnt" && (
                  <div>
                    <Label className="font-bold text-lg mb-3 block">Status ändern</Label>
                    <div className="flex flex-wrap gap-3">
                      {selectedRegistration.status === "eingereicht" && (
                        <Button
                          onClick={() => handleStatusChange(selectedRegistration.id, "wird_geprüft")}
                          disabled={isSaving}
                          variant="outline"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          In Prüfung nehmen
                        </Button>
                      )}
                      {(selectedRegistration.status === "wird_geprüft" || selectedRegistration.status === "dokument_angefordert") && (
                        <Button
                          onClick={() => handleStatusChange(selectedRegistration.id, "an_behörde_gesendet")}
                          disabled={isSaving}
                          variant="outline"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          An Behörde senden
                        </Button>
                      )}
                      {selectedRegistration.status === "an_behörde_gesendet" && (
                        <Button
                          onClick={() => handleStatusChange(selectedRegistration.id, "bei_behörde")}
                          disabled={isSaving}
                          variant="outline"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Bei Behörde markieren
                        </Button>
                      )}
                      {selectedRegistration.status === "bei_behörde" && (
                        <Button
                          onClick={() => handleApprove(selectedRegistration.id)}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Genehmigen
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Genehmigen / Ablehnen */}
                {(selectedRegistration.status === "wird_geprüft" || selectedRegistration.status === "eingereicht") && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(selectedRegistration.id)}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Genehmigen
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="rejection_reason" className="mb-2 block">
                        Ablehnungsgrund (erforderlich zum Ablehnen)
                      </Label>
                      <Textarea
                        id="rejection_reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="rounded-xl h-20 mb-2"
                        placeholder="Grund für die Ablehnung..."
                      />
                      <Button
                        onClick={() => handleReject(selectedRegistration.id)}
                        disabled={isSaving || !rejectionReason.trim()}
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bild-Vorschau Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Dokument-Vorschau</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="mt-4">
              <img 
                src={selectedImage} 
                alt="Dokument" 
                className="w-full h-auto rounded-xl"
              />
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => window.open(selectedImage, '_blank')}
                  className="flex-1"
                >
                  In neuem Tab öffnen
                </Button>
                <Button
                  onClick={() => setShowImageDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}