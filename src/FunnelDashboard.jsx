import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E5EAF0",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.06)",
};

const muted = {
  color: "#64748B",
  fontSize: "14px",
  lineHeight: 1.6,
};

const eventLabels = {
  view_teamscan_page: "Pagina bekeken",
  start_form: "Formulier gestart",
  step1_completed: "Stap 1 afgerond",
  step2_completed: "Stap 2 afgerond",
  submit_teamscan: "Aanvraag ingediend",
  teamontwikkeling_bekeken: "Teamontwikkeling bekeken",
  teamontwikkeling_teamscan_click: "Klik naar teamscan",
  teamontwikkeling_home_click: "Klik naar home",
};

const statusOptions = [
  { value: "nieuw", label: "Nieuw" },
  { value: "bekeken", label: "Bekeken" },
  { value: "contact_opgenomen", label: "Contact opgenomen" },
  { value: "intake_gepland", label: "Intake gepland" },
  { value: "teamscan_uitgezet", label: "Teamscan uitgezet" },
  { value: "afgerond", label: "Afgerond" },
  { value: "niet_passend", label: "Niet passend" },
];

const statusStyleMap = {
  nieuw: { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" },
  bekeken: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
  contact_opgenomen: { background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" },
  intake_gepland: { background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" },
  teamscan_uitgezet: { background: "#E0F2FE", color: "#0369A1", border: "1px solid #BAE6FD" },
  afgerond: { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
  niet_passend: { background: "#F8FAFC", color: "#475569", border: "1px solid #CBD5E1" },
};

function getStatusLabel(value) {
  return statusOptions.find((item) => item.value === value)?.label || "Nieuw";
}

function percentage(part, total) {
  if (!total || total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatDate(value) {
  try {
    if (!value) return "Onbekend";
    if (value.toDate) return value.toDate().toLocaleDateString("nl-NL");
    return new Date(value).toLocaleDateString("nl-NL");
  } catch {
    return "Onbekend";
  }
}

export default function FunnelDashboard() {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [updatingStatusId, setUpdatingStatusId] = useState("");

  async function loadDashboardData() {
    setLoading(true);
    setError("");

    try {
      const eventsQuery = query(
        collection(db, "teamscanEvents"),
        orderBy("timestamp", "desc"),
        limit(500)
      );

      const requestsQuery = collection(db, "teamscanSelfserviceAanvragen");

      const [eventSnap, requestSnap] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(requestsQuery),
      ]);

      const loadedEvents = eventSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const loadedRequests = requestSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.aangemaaktOp?.toDate?.() || new Date(a.createdAt || a.aangemaaktOp || 0);
          const dateB = b.createdAt?.toDate?.() || b.aangemaaktOp?.toDate?.() || new Date(b.createdAt || b.aangemaaktOp || 0);
          return dateB - dateA;
        })
        .slice(0, 100);

      setEvents(loadedEvents);
      setRequests(loadedRequests);
    } catch (err) {
      console.error(err);
      setError(
        "Dashboarddata kon niet worden geladen. Controleer of Firestore collecties teamscanEvents en teamscanSelfserviceAanvragen bestaan en of je rechten goed staan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleStatusChange(requestId, newStatus) {
    setUpdatingStatusId(requestId);
    setError("");

    try {
      await updateDoc(doc(db, "teamscanSelfserviceAanvragen", requestId), {
        status: newStatus,
        statusBijgewerktOp: new Date(),
      });

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: newStatus, statusBijgewerktOp: new Date() }
            : request
        )
      );
    } catch (err) {
      console.error(err);
      setError("Status kon niet worden bijgewerkt. Controleer of je schrijfrechten in Firestore goed staan.");
    } finally {
      setUpdatingStatusId("");
    }
  }

  const metrics = useMemo(() => {
    const count = (name) => events.filter((item) => item.event === name).length;

    const pageViews = count("view_teamscan_page");
    const formStarts = count("start_form");
    const step1 = count("step1_completed");
    const step2 = count("step2_completed");
    const submits = count("submit_teamscan");

    return {
      pageViews,
      formStarts,
      step1,
      step2,
      submits,
      startRate: percentage(formStarts, pageViews),
      submitRate: percentage(submits, pageViews),
      step1Drop: percentage(formStarts - step1, formStarts),
      step2Drop: percentage(step1 - submits, step1),
    };
  }, [events]);

  const teamontwikkelingMetrics = useMemo(() => {
    const count = (name) => events.filter((item) => item.event === name).length;

    const bekeken = count("teamontwikkeling_bekeken");
    const teamscanClicks = count("teamontwikkeling_teamscan_click");
    const homeClicks = count("teamontwikkeling_home_click");

    return {
      bekeken,
      teamscanClicks,
      homeClicks,
      teamscanClickRate: percentage(teamscanClicks, bekeken),
      homeClickRate: percentage(homeClicks, bekeken),
    };
  }, [events]);

  const averageTeamSize = useMemo(() => {
    const sizes = requests
      .map((item) => Number(item.teamSize || item.teamGrootte || item.aantalCollegas || item.aantalTeamleden || 0))
      .filter((size) => size > 0);

    if (!sizes.length) return 0;
    return Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length);
  }, [requests]);

  const statusCounts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        const status = request.status || "nieuw";
        acc[status] = (acc[status] || 0) + 1;
        acc.alle += 1;
        return acc;
      },
      { alle: 0 }
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "alle") return requests;
    return requests.filter((request) => (request.status || "nieuw") === statusFilter);
  }, [requests, statusFilter]);

  if (loading) {
    return (
      <div style={{ padding: "70px 24px", fontFamily: "Roboto, Arial, sans-serif" }}>
        <p>Dashboard laden...</p>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F9FB",
        padding: "60px 24px",
        fontFamily: "Roboto, Arial, sans-serif",
        color: "#0F172A",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ marginBottom: "34px", display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start" }}>
          <div>
          <p
            style={{
              color: "#0F766E",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "13px",
              margin: 0,
            }}
          >
            Mijn Teamkompas dashboard
          </p>
          <h1 style={{ fontSize: "42px", margin: "10px 0 12px" }}>
            teamscan funnel
          </h1>
          <p style={{ ...muted, maxWidth: "760px", fontSize: "17px" }}>
            Volg hoeveel bezoekers de teamscanpagina bekijken, hoeveel mensen het formulier starten en hoeveel aanvragen daadwerkelijk binnenkomen.
          </p>
          </div>
          <button type="button" onClick={loadDashboardData} style={{ border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", borderRadius: "12px", padding: "12px 16px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>Vernieuwen</button>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div style={cardStyle}>
            <p style={muted}>Pagina bekeken</p>
            <strong style={{ fontSize: "34px" }}>{metrics.pageViews}</strong>
          </div>
          <div style={cardStyle}>
            <p style={muted}>Formulier gestart</p>
            <strong style={{ fontSize: "34px" }}>{metrics.formStarts}</strong>
            <p style={muted}>Startpercentage: {metrics.startRate}</p>
          </div>
          <div style={cardStyle}>
            <p style={muted}>Aanvragen</p>
            <strong style={{ fontSize: "34px" }}>{requests.length}</strong>
            <p style={muted}>Conversie: {metrics.submitRate}</p>
          </div>
          <div style={cardStyle}>
            <p style={muted}>Gem. teamgrootte</p>
            <strong style={{ fontSize: "34px" }}>{averageTeamSize}</strong>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div style={cardStyle}>
            <p style={muted}>Teamontwikkeling bekeken</p>
            <strong style={{ fontSize: "34px" }}>{teamontwikkelingMetrics.bekeken}</strong>
          </div>
          <div style={cardStyle}>
            <p style={muted}>Klik naar teamscan</p>
            <strong style={{ fontSize: "34px" }}>{teamontwikkelingMetrics.teamscanClicks}</strong>
            <p style={muted}>Clickrate: {teamontwikkelingMetrics.teamscanClickRate}</p>
          </div>
          <div style={cardStyle}>
            <p style={muted}>Klik naar home</p>
            <strong style={{ fontSize: "34px" }}>{teamontwikkelingMetrics.homeClicks}</strong>
            <p style={muted}>Clickrate: {teamontwikkelingMetrics.homeClickRate}</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>funnel verloop</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              {[
                ["view_teamscan_page", metrics.pageViews],
                ["start_form", metrics.formStarts],
                ["step1_completed", metrics.step1],
                ["step2_completed", metrics.step2],
                ["submit_teamscan", metrics.submits],
              ].map(([eventName, count]) => {
                const max = Math.max(metrics.pageViews, 1);
                const width = Math.max(6, Math.round((count / max) * 100));

                return (
                  <div key={eventName}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "14px",
                      }}
                    >
                      <span>{eventLabels[eventName]}</span>
                      <strong>{count}</strong>
                    </div>
                    <div
                      style={{
                        height: "12px",
                        background: "#E2E8F0",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${width}%`,
                          background: "#0F766E",
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px",
                borderRadius: "14px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <strong>Waar mogelijk frictie zit</strong>
              <p style={muted}>
                Afhaak na start formulier: {metrics.step1Drop}. Afhaak na stap 1: {metrics.step2Drop}. Gebruik dit om te bepalen of je uitleg, vertrouwenstekst of formulierlengte moet aanpassen.
              </p>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>laatste events</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {events.slice(0, 12).map((event) => (
                <div
                  key={event.id}
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <strong>{eventLabels[event.event] || event.event}</strong>
                  <p style={{ ...muted, margin: "4px 0 0" }}>
                    {formatDate(event.timestamp || event.createdAt)}
                    {event.teamSize ? ` · teamgrootte ${event.teamSize}` : ""}
                  </p>
                </div>
              ))}
              {!events.length && <p style={muted}>Nog geen funnel-events gemeten.</p>}
            </div>
          </section>
        </div>

        <section style={{ ...cardStyle, marginTop: "22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0, marginBottom: "6px" }}>teamscan aanvragen</h2>
              <p style={{ ...muted, margin: 0 }}>
                Volg per aanvraag de opvolging van nieuw tot afgerond.
              </p>
            </div>
            <label style={{ display: "grid", gap: "6px", minWidth: "220px", fontWeight: 800 }}>
              Status filter
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  padding: "11px 12px",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontWeight: 700,
                }}
              >
                <option value="alle">Alle statussen ({statusCounts.alle || 0})</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label} ({statusCounts[status.value] || 0})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "760px",
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px" }}>organisatie</th>
                  <th style={{ padding: "12px" }}>afdeling</th>
                  <th style={{ padding: "12px" }}>aanvrager</th>
                  <th style={{ padding: "12px" }}>e-mail</th>
                  <th style={{ padding: "12px" }}>team</th>
                  <th style={{ padding: "12px" }}>status</th>
                  <th style={{ padding: "12px" }}>datum</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} style={{ borderBottom: "1px solid #EEF2F7" }}>
                    <td style={{ padding: "12px" }}>
                      {request.companyName || request.bedrijfsnaam || request.bedrijf || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {request.departmentName || request.afdeling || request.team || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {request.managerName || request.naamManager || request.managerNaam || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {request.managerEmail || request.emailManager || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {request.teamSize || request.teamGrootte || request.aantalCollegas || request.aantalTeamleden || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <select
                        value={request.status || "nieuw"}
                        disabled={updatingStatusId === request.id}
                        onChange={(event) => handleStatusChange(request.id, event.target.value)}
                        title={getStatusLabel(request.status || "nieuw")}
                        style={{
                          minWidth: "170px",
                          borderRadius: "999px",
                          padding: "7px 10px",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: updatingStatusId === request.id ? "wait" : "pointer",
                          outline: "none",
                          ...(statusStyleMap[request.status || "nieuw"] || statusStyleMap.nieuw),
                        }}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "12px" }}>{formatDate(request.createdAt || request.aangemaaktOp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!requests.length && (
            <p style={muted}>Nog geen selfservice-aanvragen ontvangen.</p>
          )}

          {requests.length > 0 && !filteredRequests.length && (
            <p style={muted}>Geen aanvragen gevonden voor deze status.</p>
          )}
        </section>
      </div>
    </main>
  );
}
