import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import HeadingCard from "../../../components/card/HeadingCard";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import {
  User,
  Activity,
  Clipboard,
  Stethoscope,
  Clock,
  Thermometer,
  Plus,
  Trash2,
} from "lucide-react";

function WalkInHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientProfileId = searchParams.get("patientProfileId") || "";
  const patientName = searchParams.get("patientName") || "";
  const existingDoctorId = searchParams.get("doctorId") || "";

  // Empty therapy object template
  const getEmptyTherapy = (initialDate = "") => ({
    treatmentName: "",
    subTherapy: "",
    daysOfTreatment: "",
    timeline: "Daily",
    duration: "",
    treatmentDescription: "",
    therapistId: [],
    specialInstructions: "",
    startDate: initialDate || new Date().toLocaleDateString("en-CA"),
  });

  // Initial empty form state
  const getEmptyFormState = () => {
    const today = new Date().toLocaleDateString("en-CA");
    return {
      doctorProfileId: "",
      nurseProfileId: "",
      appointmentTime: "",
      appointmentDate: today,
      wardCategory: "General",
      roomNumber: "",
      bedNumber: "",
      isDaycare: false,
      therapies: [getEmptyTherapy(today)],
    };
  };

  const isTherapyRowFilled = (therapy) => {
    const name = therapy?.treatmentName;
    if (!name) return false;
    if (typeof name === "string") return name.trim().length > 0;
    return Array.isArray(name) && name.length > 0;
  };

  const isTherapyRowTouched = (therapy) => {
    if (!therapy) return false;
    if (isTherapyRowFilled(therapy)) return true;
    if (therapy.subTherapy?.trim()) return true;
    if (therapy.daysOfTreatment !== "" && therapy.daysOfTreatment != null) return true;
    if (therapy.duration?.toString().trim()) return true;
    if (therapy.treatmentDescription?.trim()) return true;
    if (therapy.specialInstructions?.trim()) return true;
    if (Array.isArray(therapy.therapistId) && therapy.therapistId.length > 0) return true;
    if (therapy.timeline && therapy.timeline !== "Daily") return true;
    return false;
  };

  const validateTherapyRows = (therapies) => {
    const errors = {};
    therapies.forEach((therapy, index) => {
      if (isTherapyRowTouched(therapy) && !isTherapyRowFilled(therapy)) {
        errors[index] = {
          treatmentName: "Select Therapy is required when other therapy fields are filled",
        };
      }
    });
    return errors;
  };

  const [mode, setMode] = useState("OPD");
  const [formData, setFormData] = useState(getEmptyFormState());

  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [therapiesList, setTherapiesList] = useState([]); // Renamed from 'therapies' to avoid confusion
  const [subTherapiesList, setSubTherapiesList] = useState([]);


  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedTherapyIds, setDeletedTherapyIds] = useState([]);
  const [displayPatientName, setDisplayPatientName] = useState(patientName || "");
  const [therapyErrors, setTherapyErrors] = useState({});
  const [patientOptions, setPatientOptions] = useState([]);
  const [isLoadingPatientOptions, setIsLoadingPatientOptions] = useState(false);
  const formatDateForInput = (date) => {
    if (!date) return new Date().toLocaleDateString("en-CA");
    const d = new Date(date);
    return d.toLocaleDateString("en-CA");
  };

  const mapReceptionPatientToOption = (p) => {
    const profileId = p.patientProfile?._id || p.patientProfile;
    if (!profileId) return null;
    return {
      patientProfileId: String(profileId),
      patientName: p.patientName || "",
      contactNumber: p.contactNumber || "",
      doctorId: String(
        p.patientProfile?.primaryDoctor?._id ||
          p.patientProfile?.primaryDoctor ||
          "",
      ),
      receptionPatientId: p._id,
    };
  };

  const fetchPatientOptions = useCallback(async () => {
    setIsLoadingPatientOptions(true);
    try {
      const res = await axios.get(getApiUrl("reception-patients"), {
        headers: getAuthHeaders(),
        params: { page: 1, limit: 10000 },
      });
      if (res.data.success) {
        const seen = new Set();
        const options = (res.data.data || [])
          .map(mapReceptionPatientToOption)
          .filter((opt) => {
            if (!opt) return false;
            if (seen.has(opt.patientProfileId)) return false;
            seen.add(opt.patientProfileId);
            return true;
          })
          .sort((a, b) =>
            (a.patientName || "").localeCompare(b.patientName || "", undefined, {
              sensitivity: "base",
            }),
          );
        setPatientOptions(options);
      }
    } catch (error) {
      console.error("Error fetching patients for selection:", error);
      toast.error("Failed to load patient list");
    } finally {
      setIsLoadingPatientOptions(false);
    }
  }, []);

  const filterPatientOptions = useMemo(
    () =>
      createFilterOptions({
        stringify: (option) =>
          `${option.patientName || ""} ${option.contactNumber || ""}`.toLowerCase(),
        limit: 80,
        matchFrom: "any",
      }),
    [],
  );

  const handlePatientSwitch = (option) => {
    if (!option?.patientProfileId) return;
    if (option.patientProfileId === patientProfileId) return;

    const params = new URLSearchParams({
      patientProfileId: option.patientProfileId,
      patientName: option.patientName || "",
      doctorId: option.doctorId || existingDoctorId || formData.doctorProfileId || "",
    });
    navigate(`/receptionist/walk-in-hub?${params.toString()}`, { replace: true });
  };

  const getCurrentPatientOption = () => {
    const fromList = patientOptions.find(
      (o) => o.patientProfileId === patientProfileId,
    );
    if (fromList) return fromList;
    if (!patientProfileId) return null;
    return {
      patientProfileId,
      patientName: displayPatientName || patientName || "",
      contactNumber: "",
      doctorId: existingDoctorId || formData.doctorProfileId || "",
      receptionPatientId: "",
    };
  };

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [doctorsRes, nursesRes, therapistsRes, therapiesRes, subTherapiesRes] =
        await Promise.all([
          axios.get(getApiUrl("doctors/profiles"), {
            headers: getAuthHeaders(),
          }),
          axios.get(getApiUrl("nurses?limit=1000"), {
            headers: getAuthHeaders(),
          }), // Fetch all nurses
          axios.get(getApiUrl("therapists"), { headers: getAuthHeaders() }),
          axios.get(getApiUrl("therapies?limit=100"), {
            headers: getAuthHeaders(),
          }),
          axios.get(getApiUrl("sub-therapies?limit=200"), {
            headers: getAuthHeaders(),
          }),
        ]);

      if (doctorsRes.data.success) setDoctors(doctorsRes.data.data || []);
      if (nursesRes.data.success) {
        const nursesData = nursesRes.data.data || [];
        setNurses(nursesData);
      }
      if (therapistsRes.data.success)
        setTherapists(therapistsRes.data.data || []);
      if (therapiesRes.data.success)
        setTherapiesList(therapiesRes.data.data || []);
      if (subTherapiesRes.data.success)
        setSubTherapiesList(subTherapiesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load required data");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const loadTherapiesForMode = useCallback(
    async (targetMode) => {
      if (!patientProfileId) return;
      try {
        if (targetMode === "IPD") {
          const sessionsRes = await axios.get(
            getApiUrl(
              `therapist-sessions/treatment-list?type=IPD&patientId=${patientProfileId}`,
            ),
            { headers: getAuthHeaders() },
          );
          const sessions =
            sessionsRes.data?.success && Array.isArray(sessionsRes.data.data)
              ? sessionsRes.data.data
              : [];

          const mapped = sessions.map((s) => {
            // Keep therapistId values aligned with the Select options (therapist user IDs)
            const therapistIds = Array.isArray(s.therapists)
              ? s.therapists
                  .map((t) => t?.user?._id || t?.user)
                  .filter(Boolean)
              : s.therapist?.user?._id || s.therapist?.user
                ? [s.therapist.user?._id || s.therapist.user]
                : [];
            return {
              _id: s._id,
              treatmentName: s.treatmentName || "",
              subTherapy: s.subTherapy || "",
              daysOfTreatment: s.daysOfTreatment || 0,
              timeline: s.timeline || "Daily",
              duration: s.duration || "",
              treatmentDescription: s.treatmentDescription || "",
              therapistId: therapistIds,
              specialInstructions: s.specialInstructions || "",
              startDate: formatDateForInput(s.sessionDate || s.createdAt),
            };
          });

          setFormData((prev) => ({
            ...prev,
            therapies:
              mapped.length > 0
                ? mapped
                : [getEmptyTherapy(prev.appointmentDate)],
          }));
          return;
        }

        // OPD: treatment plans
        const plansRes = await axios.get(
          getApiUrl(`examinations/therapy-plans/patient/${patientProfileId}`),
          { headers: getAuthHeaders() },
        );

        if (plansRes.data.success && plansRes.data.data?.length > 0) {
          const plans = plansRes.data.data;
          const mappedTherapies = plans.map((plan) => {
            const assignedTherapistIds = Array.isArray(plan.therapistId)
              ? plan.therapistId
              : plan.therapistId
                ? [plan.therapistId]
                : [];
            return {
              _id: plan._id,
              treatmentName: Array.isArray(plan.treatmentName)
                ? plan.treatmentName[0] || ""
                : plan.treatmentName || "",
              daysOfTreatment: plan.daysOfTreatment || 0,
              timeline: plan.timeline || "Daily",
              specialInstructions: plan.specialInstructions || "",
              subTherapy: plan.subTherapy || "",
              duration: plan.duration || "",
              treatmentDescription: plan.treatmentDescription || "",
              therapistId: assignedTherapistIds,
              startDate: formatDateForInput(plan.startDate),
            };
          });

          setFormData((prev) => ({
            ...prev,
            therapies:
              mappedTherapies.length > 0
                ? mappedTherapies
                : [getEmptyTherapy(prev.appointmentDate)],
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            therapies: [getEmptyTherapy(prev.appointmentDate)],
          }));
        }
      } catch (e) {
        console.error("[WalkInHub] Error loading therapies for mode:", e);
      }
    },
    [patientProfileId],
  );

  // Fetch existing patient assignments
  const loadExistingAssignments = useCallback(async () => {
    if (!patientProfileId) return;

    setIsLoadingExistingData(true);

    const formatTimeForInput = (timeStr) => {
      if (!timeStr) return "";
      if (typeof timeStr === "string" && timeStr.match(/^\d{2}:\d{2}$/))
        return timeStr;
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return "";
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    try {
      // Fetch patient profile
      const patientRes = await axios.get(
        getApiUrl(`patients/${patientProfileId}`),
        { headers: getAuthHeaders() },
      );

      if (patientRes.data.success && patientRes.data.data) {
        const patient = patientRes.data.data;

        setDisplayPatientName(patient.user?.name || patientName || "");

        // Check active admission status first
        let hasActiveAdmission = false;
        let inpatientsList = [];
        try {
          const inpatientsRes = await axios.get(
            getApiUrl(`inpatients/patient/${patientProfileId}`),
            { headers: getAuthHeaders() },
          );
          inpatientsList = inpatientsRes.data.success
            ? Array.isArray(inpatientsRes.data.data)
              ? inpatientsRes.data.data
              : [inpatientsRes.data.data].filter(Boolean)
            : [];
          hasActiveAdmission = inpatientsList.some(
            (ip) => ip && ip.status === "Admitted",
          );
        } catch (e) {
          console.warn("Error checking inpatient status:", e);
        }

        // Check if patient is discharged - if so, show empty form for fresh re-appointment
        let isDischarged = false;
        try {
          if (
            patient.admissionStatus === "In-patient" ||
            patient.inpatient === true ||
            hasActiveAdmission
          ) {
            // IPD context: discharged = no active admission
            if (!hasActiveAdmission) {
              isDischarged = true;
            }
          } else {
            // OPD check
            const examsRes = await axios.get(
              getApiUrl(
                `examinations?patientId=${patientProfileId}&limit=1&hasInpatient=false`,
              ),
              { headers: getAuthHeaders() },
            );
            const exams =
              examsRes.data.success && examsRes.data.data
                ? Array.isArray(examsRes.data.data)
                  ? examsRes.data.data
                  : examsRes.data.data?.data || []
                : [];
            const latestExam = exams[0];
            if (latestExam && latestExam.isBilled) {
              const invRes = await axios
                .get(getApiUrl("invoices"), {
                  headers: getAuthHeaders(),
                  params: { page: 1, limit: 500 },
                })
                .catch(() => ({ data: { success: false, data: [] } }));
              const invoices = invRes.data.success
                ? Array.isArray(invRes.data.data)
                  ? invRes.data.data
                  : invRes.data.data?.data || []
                : [];
              const invoiceForExam = invoices.find(
                (inv) =>
                  (inv.examination?._id || inv.examination)?.toString() ===
                  (latestExam._id || latestExam).toString(),
              );
              if (invoiceForExam) {
                const paid =
                  (invoiceForExam.amountPaid || 0) >=
                  (invoiceForExam.totalPayable || 0);
                if (paid && (invoiceForExam.totalPayable || 0) > 0) {
                  isDischarged = true;
                }
              }
            }
          }
        } catch (dischargeErr) {
          console.warn(
            "[WalkInHub] Error checking discharge status:",
            dischargeErr,
          );
        }

        if (isDischarged) {
          setMode("OPD");
          setFormData(getEmptyFormState());
          setIsLoadingExistingData(false);
          return;
        }

        let currentInpatientId = null;

        // Determine mode based on admission status - Check ALL indicators
        if (
          patient.admissionStatus === "In-patient" ||
          patient.inpatient === true ||
          hasActiveAdmission
        ) {
          setMode("IPD");

          try {
            const inpatientsRes = await axios.get(
              getApiUrl(`inpatients/patient/${patientProfileId}`),
              { headers: getAuthHeaders() },
            );

            if (inpatientsRes.data.success) {
              const inpatient = Array.isArray(inpatientsRes.data.data)
                ? inpatientsRes.data.data.find(
                  (ip) => ip.status === "Admitted",
                ) || inpatientsRes.data.data[0]
                : inpatientsRes.data.data;

              if (!inpatient) return;

              currentInpatientId = inpatient._id;

              // Fetch latest IPD examination
              let latestIpdExamDoctorId = "";
              try {
                const ipdExamsRes = await axios.get(
                  getApiUrl(`examinations/inpatient/${inpatient._id}`),
                  { headers: getAuthHeaders() },
                );
                const ipdExams =
                  ipdExamsRes.data?.success && ipdExamsRes.data?.data
                    ? Array.isArray(ipdExamsRes.data.data)
                      ? ipdExamsRes.data.data
                      : []
                    : [];

                const sortedIpdExams = ipdExams.sort((a, b) => {
                  const dateA = new Date(a.updatedAt || a.createdAt || 0);
                  const dateB = new Date(b.updatedAt || b.createdAt || 0);
                  return dateB - dateA;
                });
                const latestIpdExam = sortedIpdExams[0];
                const resolvedIpdDoctor = latestIpdExam?.doctor || latestIpdExam?.patient?.primaryDoctor;
                if (resolvedIpdDoctor) {
                  latestIpdExamDoctorId =
                    typeof resolvedIpdDoctor === "object"
                      ? (resolvedIpdDoctor._id || resolvedIpdDoctor)?.toString?.()
                      : String(resolvedIpdDoctor);
                }
              } catch (e) {
                console.warn("[WalkInHub] Error fetching IPD examinations:", e);
              }


              let nurseId = "";
              if (inpatient.allocatedNurse) {
                if (
                  typeof inpatient.allocatedNurse === "object" &&
                  inpatient.allocatedNurse._id
                ) {
                  nurseId = inpatient.allocatedNurse._id.toString();
                } else {
                  nurseId = inpatient.allocatedNurse.toString();
                }
              } else if (patient.allocatedNurse) {
                if (
                  typeof patient.allocatedNurse === "object" &&
                  patient.allocatedNurse._id
                ) {
                  nurseId = patient.allocatedNurse._id.toString();
                } else {
                  nurseId = patient.allocatedNurse.toString();
                }
              }

              setFormData((prev) => ({
                ...prev,
                doctorProfileId:
                  existingDoctorId ||
                  (patient.primaryDoctor?._id || patient.primaryDoctor) ||
                  latestIpdExamDoctorId ||
                  inpatient.doctor?._id ||
                  "",
                nurseProfileId: nurseId,
                wardCategory: inpatient.wardCategory || "General",
                roomNumber: inpatient.roomNumber || "",
                bedNumber: inpatient.bedNumber || "",
                appointmentTime: formatTimeForInput(inpatient.admissionDate),
                appointmentDate: formatDateForInput(inpatient.admissionDate),
              }));
            }
          } catch (err) {
            console.error("Error fetching inpatient data:", err);
          }
        } else {
          setMode("OPD");

          // Fetch latest OPD examination
          let latestExamDoctorId = "";
          try {
            const examsRes = await axios.get(
              getApiUrl(
                `examinations?patientId=${patientProfileId}&limit=1&hasInpatient=false`,
              ),
              { headers: getAuthHeaders() },
            );
            const examsData =
              examsRes.data.success && examsRes.data.data
                ? Array.isArray(examsRes.data.data)
                  ? examsRes.data.data
                  : examsRes.data.data?.data || []
                : [];
            const latestExam = examsData[0];
            const resolvedOpdDoctor = latestExam?.doctor || latestExam?.patient?.primaryDoctor;
            if (resolvedOpdDoctor) {
              latestExamDoctorId =
                typeof resolvedOpdDoctor === "object"
                  ? (resolvedOpdDoctor._id || resolvedOpdDoctor)?.toString?.()
                  : String(resolvedOpdDoctor);
            }
            const isDaycare = !!latestExam?.isDaycare;
            setFormData(prev => ({ ...prev, isDaycare }));
          } catch (e) {
            console.warn("[WalkInHub] Error fetching latest examination:", e);
          }

          // Fetch latest appointment
          try {
            const appointmentsRes = await axios.get(
              getApiUrl(`appointments?patientId=${patientProfileId}&limit=1`),
              { headers: getAuthHeaders() },
            );

            if (
              appointmentsRes.data.success &&
              appointmentsRes.data.data?.length > 0
            ) {
              const appointment = appointmentsRes.data.data[0];


              let nurseId = "";
              if (patient.allocatedNurse) {
                if (
                  typeof patient.allocatedNurse === "object" &&
                  patient.allocatedNurse._id
                ) {
                  nurseId = patient.allocatedNurse._id.toString();
                } else {
                  nurseId = patient.allocatedNurse.toString();
                }
              }

              setFormData((prev) => ({
                ...prev,
                doctorProfileId:
                  existingDoctorId ||
                  (patient.primaryDoctor?._id || patient.primaryDoctor) ||
                  latestExamDoctorId ||
                  appointment.doctor?._id ||
                  "",
                nurseProfileId: nurseId,
                appointmentTime: formatTimeForInput(
                  appointment.appointmentTime,
                ),
                appointmentDate: formatDateForInput(
                  appointment.appointmentDate,
                ),
              }));
            } else {
              let nurseId = "";
              if (patient.allocatedNurse) {
                if (
                  typeof patient.allocatedNurse === "object" &&
                  patient.allocatedNurse._id
                ) {
                  nurseId = patient.allocatedNurse._id.toString();
                } else {
                  nurseId = patient.allocatedNurse.toString();
                }
              }

              setFormData((prev) => ({
                ...prev,
                doctorProfileId:
                  existingDoctorId ||
                  (patient.primaryDoctor?._id || patient.primaryDoctor) ||
                  latestExamDoctorId ||
                  "",
                nurseProfileId: nurseId,
              }));
            }
          } catch (err) {
            console.error("Error fetching appointment data:", err);
            let nurseId = "";
            if (patient.allocatedNurse) {
              nurseId =
                patient.allocatedNurse._id || patient.allocatedNurse || "";
            }

            setFormData((prev) => ({
              ...prev,
              doctorProfileId:
                existingDoctorId ||
                (patient.primaryDoctor?._id || patient.primaryDoctor) ||
                latestExamDoctorId ||
                "",
              nurseProfileId: nurseId,
            }));
          }
        }

        // Load therapy data for current mode (OPD plans vs IPD sessions)
        await loadTherapiesForMode(
          patient.admissionStatus === "In-patient" ||
            patient.inpatient === true ||
            hasActiveAdmission
            ? "IPD"
            : "OPD",
        );

        if (
          (!formData?.therapies || formData.therapies.length === 0) &&
          patient.assignedTherapy
        ) {
            // Fallback to patient profile data

            setFormData((prev) => ({
              ...prev,
              therapies: [
                {
                  treatmentName:
                    patient.assignedTherapy?.therapyName ||
                    patient.assignedTherapy ||
                    "",
                  daysOfTreatment: patient.therapyDurationDays || 0,
                  timeline: patient.therapyTimeline || "Daily",
                  specialInstructions: patient.therapyInstructions || "",
                  subTherapy: patient.subTherapy || "",
                  duration: patient.duration || "",
                  treatmentDescription: patient.treatmentDescription || "",
                  therapistId: patient.primaryTherapist
                    ? [patient.primaryTherapist._id || patient.primaryTherapist]
                    : [],
                  startDate: formatDateForInput(patient.therapyStartDate),
                },
              ],
            }));
        }
      }
    } catch (error) {
      console.error("Error loading existing assignments:", error);
    } finally {
      setIsLoadingExistingData(false);
    }
  }, [patientProfileId, existingDoctorId, loadTherapiesForMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (patientProfileId && !isLoadingData) {
      loadExistingAssignments();
    }
  }, [patientProfileId, isLoadingData, loadExistingAssignments]);

  useEffect(() => {
    setDeletedTherapyIds([]);
    setFormData(getEmptyFormState());
    setDisplayPatientName(patientName || "");
    setTherapyErrors({});
  }, [patientProfileId, patientName]);

  useEffect(() => {
    fetchPatientOptions();
  }, [fetchPatientOptions]);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setDeletedTherapyIds([]);
      // Immediately sync therapy list to selected mode to avoid OPD/IPD mismatch
      loadTherapiesForMode(newMode);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // When appointment date changes, sync therapy Start Dates that are still "today" to the new date
      if (name === "appointmentDate" && value) {
        const todayStr = new Date().toLocaleDateString("en-CA");
        next.therapies = prev.therapies.map((t) =>
          t.startDate === todayStr ? { ...t, startDate: value } : t,
        );
      }
      // When doctor is removed, also clear appointment time and date
      if (name === "doctorProfileId" && !value) {
        next.appointmentTime = "";
        next.appointmentDate = "";
      }
      return next;
    });
  };

  const handleTherapyChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedTherapies = [...prev.therapies];
      updatedTherapies[index] = {
        ...updatedTherapies[index],
        [field]: value,
      };
      const updatedRow = updatedTherapies[index];
      setTherapyErrors((prevErrors) => {
        if (!prevErrors[index]) return prevErrors;
        if (isTherapyRowFilled(updatedRow) || !isTherapyRowTouched(updatedRow)) {
          const next = { ...prevErrors };
          delete next[index];
          return next;
        }
        return prevErrors;
      });
      return { ...prev, therapies: updatedTherapies };
    });
  };

  const handleAddTherapy = () => {
    setFormData((prev) => ({
      ...prev,
      therapies: [...prev.therapies, getEmptyTherapy(prev.appointmentDate)],
    }));
  };

  const handleRemoveTherapy = (index) => {
    setFormData((prev) => {
      const toRemove = prev.therapies[index];
      if (toRemove?._id) {
        setDeletedTherapyIds((ids) =>
          ids.includes(toRemove._id) ? ids : [...ids, toRemove._id],
        );
      }
      setTherapyErrors((prevErrors) => {
        const next = {};
        Object.entries(prevErrors).forEach(([key, val]) => {
          const i = Number(key);
          if (i < index) next[i] = val;
          if (i > index) next[i - 1] = val;
        });
        return next;
      });
      return {
        ...prev,
        therapies: prev.therapies.filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientProfileId) {
      toast.error("Patient identification is missing");
      return;
    }

    const therapyValidationErrors = validateTherapyRows(formData.therapies);
    if (Object.keys(therapyValidationErrors).length > 0) {
      setTherapyErrors(therapyValidationErrors);
      toast.error("Please select Therapy for any row where you filled other fields");
      return;
    }
    setTherapyErrors({});

    const payload = {
      mode,
      patientProfileId,
      doctorProfileId: formData.doctorProfileId || null,
      nurseProfileId: formData.nurseProfileId || undefined,
      wardCategory: mode === "IPD" ? formData.wardCategory : undefined,
      roomNumber: mode === "IPD" ? formData.roomNumber : undefined,
      bedNumber: mode === "IPD" ? formData.bedNumber : undefined,
      isDaycare: mode === "OPD" ? formData.isDaycare : undefined,
      appointmentTime: formData.appointmentTime || undefined,
      appointmentDate: formData.appointmentDate,
      therapies: formData.therapies.filter((t) => !t._id && isTherapyRowFilled(t)),
      therapyUpdates: formData.therapies
        .filter((t) => t._id && isTherapyRowFilled(t))
        .map((t) => ({
          planId: t._id,
          treatmentName: t.treatmentName,
          startDate: t.startDate,
          therapistId: t.therapistId,
          subTherapy: t.subTherapy,
          duration: t.duration,
          treatmentDescription: t.treatmentDescription,
          specialInstructions: t.specialInstructions,
          daysOfTreatment: t.daysOfTreatment,
          timeline: t.timeline,
        })),
      therapyDeleteIds: deletedTherapyIds,
    };

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        getApiUrl("walk-in/hub-submit"),
        payload,
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        toast.success(
          response.data.message || `Walk-in ${mode} record created!`,
        );
        navigate("/receptionist/appointments");
      }
    } catch (error) {
      console.error("Error submitting walk-in hub:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to submit walk-in record",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      <HeadingCard
        title="Walk-in Patient Hub"
        subtitle={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {`Current Patient: ${displayPatientName || patientName || "Loading..."}`}
            {formData.isDaycare && (
              <Chip
                label="Daycare"
                size="small"
                color="primary"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              />
            )}
          </Box>
        }
        breadcrumbItems={[
          { label: "Receptionist", url: "/receptionist/dashboard" },
          { label: "Appointments", url: "/receptionist/appointments" },
          { label: "Walk-in Hub" },
        ]}
      />

      <Box sx={{ maxWidth: "900px", mx: "auto", mt: 4, px: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "16px",
            border: "1px solid var(--color-border-a)",
          }}
        >
          {isLoadingExistingData && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
              }}
            >
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading existing assignments...
              </Typography>
            </Box>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {/* Section 1: Admission Mode */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Admission Category
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  size="small"
                  sx={{
                    gap: 2,
                    "& .MuiToggleButton-root": {
                      px: 4,
                      py: 1,
                      border: "1px solid var(--color-border-a) !important",
                      borderRadius: "25px !important",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      color: "var(--color-text-b)",
                      fontWeight: 600,
                      textTransform: "none",
                      "&.Mui-selected": {
                        backgroundColor:
                          mode === "OPD"
                            ? "#2e7d32 !important"
                            : "#1976d2 !important",
                        color: "white !important",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                        transform: "translateY(-2px)",
                        "&:hover": {
                          opacity: 0.9,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="OPD">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Clock size={18} />
                      OPD
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="IPD">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Activity size={18} />
                      IPD
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 2: Patient Details (Editable) */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <User size={20} color="var(--color-primary-a)" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Patient Details
                </Typography>
                {mode === "OPD" && (
                  <Box
                    sx={{
                      ml: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8 }
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, isDaycare: !prev.isDaycare }))}
                  >
                    <Checkbox
                      size="small"
                      checked={formData.isDaycare}
                      sx={{ p: 0.5 }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Is Daycare Patient?
                    </Typography>
                  </Box>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    openOnFocus
                    selectOnFocus
                    handleHomeEndKeys
                    clearOnBlur={false}
                    options={patientOptions}
                    loading={isLoadingPatientOptions}
                    value={getCurrentPatientOption()}
                    getOptionLabel={(option) => option?.patientName || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.patientProfileId === value?.patientProfileId
                    }
                    filterOptions={filterPatientOptions}
                    noOptionsText={
                      isLoadingPatientOptions
                        ? "Loading patients..."
                        : "No patient found"
                    }
                    onOpen={() => {
                      if (patientOptions.length === 0) {
                        fetchPatientOptions();
                      }
                    }}
                    onChange={(_, newValue) => {
                      if (newValue?.patientProfileId) {
                        handlePatientSwitch(newValue);
                      }
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.patientProfileId}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.patientName}
                          </Typography>
                          {option.contactNumber ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {option.contactNumber}
                            </Typography>
                          ) : null}
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Patient Name"
                        required
                        placeholder="Type to search, then select patient..."
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingPatientOptions ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 3: Assignments */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Stethoscope size={20} color="var(--color-primary-a)" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Assignments
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                  <InputLabel>Assign Doctor</InputLabel>
                  <Select
                    name="doctorProfileId"
                    value={formData.doctorProfileId}
                    onChange={handleChange}
                    label="Assign Doctor"
                    disabled={isLoadingData}
                  >
                    <MenuItem value="">Select Doctor</MenuItem>
                    {doctors.map((doc) => (
                      <MenuItem key={doc._id} value={doc._id}>
                        {doc.user?.name || "Doctor"} - {doc.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Appointment Time"
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  sx={{ flex: 1, minWidth: "250px" }}
                />

                <TextField
                  label="Appointment Date"
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ flex: 1, minWidth: "250px" }}
                />

                 <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                   <InputLabel>Assign Nurse</InputLabel>
                   <Select
                     name="nurseProfileId"
                     value={formData.nurseProfileId}
                     onChange={handleChange}
                     label="Assign Nurse"
                     disabled={isLoadingData}
                   >
                     <MenuItem value="">Unassigned</MenuItem>
                     {nurses.map((nurse) => {
                       let nurseProfileId = "";
                       if (nurse.profileId) {
                         nurseProfileId = nurse.profileId.toString();
                       } else if (
                         nurse._id &&
                         typeof nurse._id === "object" &&
                         nurse._id.toString
                       ) {
                         nurseProfileId = nurse._id.toString();
                       } else if (nurse._id) {
                         nurseProfileId = nurse._id.toString();
                       }

                       const nurseName =
                         nurse.user?.name || nurse.name || "Nurse";

                       return (
                         <MenuItem
                           key={nurseProfileId || nurse._id}
                           value={nurseProfileId}
                         >
                           {nurseName}
                         </MenuItem>
                       );
                     })}
                   </Select>
                 </FormControl>
               </Box>

               {mode === "IPD" && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3 }}>
                  <FormControl sx={{ flex: 1, minWidth: "250px" }}>
                    <InputLabel>Ward Category</InputLabel>
                    <Select
                      name="wardCategory"
                      value={formData.wardCategory}
                      onChange={handleChange}
                      label="Ward Category"
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Duplex">Duplex</MenuItem>
                      <MenuItem value="Special">Special</MenuItem>
                      <MenuItem value="Semi Special">Semi Special</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Room Number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    sx={{ flex: 1, minWidth: "250px" }}
                  />

                  <TextField
                    label="Bed Number"
                    name="bedNumber"
                    value={formData.bedNumber}
                    onChange={handleChange}
                    sx={{ flex: 1, minWidth: "250px" }}
                  />
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Section 4: Therapy (Optional) */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Clipboard size={20} color="var(--color-primary-a)" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Therapy Planning
                  </Typography>
                </Box>
              </Box>

              {formData.therapies.map((therapy, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: "12px",
                    border: "1px solid var(--color-border-a)",
                    backgroundColor: "#fafafa",
                    position: "relative",
                  }}
                >
                  {formData.therapies.length > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveTherapy(index)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  )}

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Row 1: Select Therapy and Sub Therapy */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <FormControl
                        sx={{ flex: 2, minWidth: "300px" }}
                        variant="outlined"
                        required={isTherapyRowTouched(therapy)}
                        error={!!therapyErrors[index]?.treatmentName}
                      >
                        <InputLabel shrink>Select Therapy</InputLabel>
                        <Select
                          displayEmpty
                          value={therapy.treatmentName || ""}
                          onChange={(e) =>
                            handleTherapyChange(
                              index,
                              "treatmentName",
                              e.target.value,
                            )
                          }
                          label="Select Therapy"
                          notched
                        >
                          <MenuItem value="">
                            <em style={{ color: "#999" }}>Optional</em>
                          </MenuItem>
                          {therapiesList.map((t) => (
                            <MenuItem key={t._id} value={t.therapyName}>
                              <ListItemText primary={t.therapyName} />
                            </MenuItem>
                          ))}
                        </Select>
                        {therapyErrors[index]?.treatmentName && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {therapyErrors[index].treatmentName}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl sx={{ flex: 1, minWidth: "250px" }} variant="outlined">
                        <InputLabel shrink>Sub Therapy</InputLabel>
                        <Select
                          displayEmpty
                          value={therapy.subTherapy || ""}
                          onChange={(e) =>
                            handleTherapyChange(
                              index,
                              "subTherapy",
                              e.target.value,
                            )
                          }
                          label="Sub Therapy"
                          notched
                        >
                          <MenuItem value="">
                            <em style={{ color: "#999" }}>Optional</em>
                          </MenuItem>
                          {subTherapiesList.map((st) => (
                            <MenuItem key={st._id} value={st.name}>
                              {st.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Row 2: Session, Timeline, Duration */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <TextField
                        label="Session"
                        type="number"
                        value={therapy.daysOfTreatment}
                        onChange={(e) =>
                          handleTherapyChange(
                            index,
                            "daysOfTreatment",
                            e.target.value,
                          )
                        }
                        sx={{ flex: 1, minWidth: "150px" }}
                        inputProps={{ min: 0 }}
                      />

                      <FormControl sx={{ flex: 1, minWidth: "150px" }} variant="outlined">
                        <InputLabel shrink>Timeline</InputLabel>
                        <Select
                          value={therapy.timeline || "Daily"}
                          onChange={(e) =>
                            handleTherapyChange(
                              index,
                              "timeline",
                              e.target.value,
                            )
                          }
                          label="Timeline"
                          notched
                        >
                          <MenuItem value="Daily">Daily</MenuItem>
                          <MenuItem value="AlternateDay">
                            Alternate Days
                          </MenuItem>
                          <MenuItem value="Weekly">Weekly</MenuItem>
                          <MenuItem value="Monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ flex: 1, minWidth: "200px" }}
                        label="Duration"
                        type="number"
                        value={therapy.duration}
                        onChange={(e) =>
                          handleTherapyChange(index, "duration", e.target.value)
                        }
                        placeholder="e.g. 45"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">min</InputAdornment>
                          ),
                          inputProps: { min: 0 },
                        }}
                      />
                    </Box>

                    {/* Row 3: Treatment Description */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <TextField
                        sx={{ flex: 1, minWidth: "100%" }}
                        label="Treatment Description"
                        value={therapy.treatmentDescription}
                        onChange={(e) =>
                          handleTherapyChange(
                            index,
                            "treatmentDescription",
                            e.target.value,
                          )
                        }
                        multiline
                        rows={3}
                        placeholder="Enter detailed description of the treatment..."
                      />
                    </Box>

                    {/* Row 4: Assign Therapist, Special Instructions, Start Date */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <FormControl sx={{ flex: 1, minWidth: "250px" }} variant="outlined">
                        <InputLabel shrink>Assign Therapist</InputLabel>
                        <Select
                          multiple
                          value={therapy.therapistId || []}
                          onChange={(e) =>
                            handleTherapyChange(
                              index,
                              "therapistId",
                              typeof e.target.value === "string"
                                ? e.target.value.split(",")
                                : e.target.value,
                            )
                          }
                          label="Assign Therapist"
                          notched
                          input={<OutlinedInput label="Assign Therapist" notched />}
                          renderValue={(selected) => (
                            selected.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                Optional
                              </Typography>
                            ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => {
                                const therapist = therapists.find(
                                  (th) =>
                                    th?._id === value ||
                                    th?.user?._id === value,
                                );
                                return (
                                  <Chip
                                    key={value}
                                    label={therapist?.user?.name || "Therapist"}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                            )
                          )}
                        >
                          {therapists.map((th) => {
                            const thId = th.user?._id || th._id;
                            const selectedTherapists = therapy.therapistId || [];
                            return (
                              <MenuItem key={thId} value={thId}>
                                <Checkbox
                                  checked={selectedTherapists.indexOf(thId) > -1}
                                />
                                <ListItemText
                                  primary={th.user?.name || "Therapist"}
                                  secondary={
                                    th.specialization ||
                                    th.speciality ||
                                    "General"
                                  }
                                />
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      <TextField
                        sx={{ flex: 1, minWidth: "250px" }}
                        label="Special Instructions"
                        value={therapy.specialInstructions}
                        onChange={(e) =>
                          handleTherapyChange(
                            index,
                            "specialInstructions",
                            e.target.value,
                          )
                        }
                      />

                      <TextField
                        sx={{ flex: 1, minWidth: "250px" }}
                        label="Start Date"
                        type="date"
                        value={therapy.startDate}
                        onChange={(e) =>
                          handleTherapyChange(
                            index,
                            "startDate",
                            e.target.value,
                          )
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  startIcon={<Plus size={18} />}
                  variant="outlined"
                  size="small"
                  onClick={handleAddTherapy}
                  sx={{
                    borderColor: "var(--color-primary-a)",
                    color: "var(--color-primary-a)",
                    "&:hover": {
                      borderColor: "var(--color-primary-a)",
                      backgroundColor: "rgba(139, 69, 19, 0.04)",
                    },
                  }}
                >
                  Add Another Therapy
                </Button>
              </Box>
            </Box>

            {/* Submit Button */}
            <Box
              sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  color: "var(--color-text-a)",
                }}
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  borderRadius: "8px",
                  backgroundColor: "#8B4513 !important",
                  color: "white !important",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                  "&:hover": {
                    backgroundColor: "#5D2E0A !important",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#f5f5f5 !important",
                    color: "#bdbdbd !important",
                    boxShadow: "none",
                  },
                }}
                disabled={isSubmitting || isLoadingData}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    SUBMITTING...
                  </>
                ) : (
                  `SUBMIT AS ${mode}`
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default WalkInHub;
