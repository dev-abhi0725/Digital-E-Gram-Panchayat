// StaffDashboard.js
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Button, Table } from "react-bootstrap";
import SchemeApplicationForm from "../Components/SchemeForm";

const StaffDashboard = () => {
  const db = getFirestore();
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedSection, setSelectedSection] = useState("scheme");
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const schemesQuery = query(
      collection(db, "schemes"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeSchemes = onSnapshot(schemesQuery, (snapshot) => {
      setSchemes(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
          };
        })
      );
    });

    const applicationsQuery = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeApplications = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        setApplications(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    return () => {
      unsubscribeSchemes();
      unsubscribeApplications();
    };
  }, [db]);

  const handleDeleteScheme = async (schemeId) => {
    if (window.confirm("Are you sure you want to delete this scheme?")) {
      await deleteDoc(doc(db, "schemes", schemeId));
      alert("Scheme deleted successfully!");
    }
  };

  const handleDecision = async (applicationId, decision) => {
    if (
      window.confirm(`Are you sure you want to ${decision} this application?`)
    ) {
      const applicationRef = doc(db, "applications", applicationId);
      await updateDoc(applicationRef, {
        staffStatus: decision,
        forwardedToAdmin: decision === "Approved" ? true : false,
      });
      alert(`Application ${decision} successfully!`);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  return (
    <div className="container mt-4">
      <h2 className="admintext">Staff Dashboard</h2>

      <div className="mt-3 mb-3 menu-bar ">
        <Button
          className="menu-item b-bt"
          onClick={() => setSelectedSection("scheme")}
        >
          Schemes
        </Button>
        <Button
          className=" menu-item b-bt"
          onClick={() => setSelectedSection("application")}
        >
          User Applications
        </Button>
      </div>

      {selectedSection === "scheme" && (
        <>
          <h4 className=" h-name">Schemes</h4>
          {schemes.length === 0 ? (
            <p>No schemes available.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className=" e-name">Name</th>
                  {/* <th className=" e-name">Type</th> */}
                  <th className=" e-name">Date Created</th>
                  <th className=" e-name">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td className=" s-name">{scheme.name}</td>
                    {/* <td className=" s-name">{scheme.type}</td> */}
                    <td className=" s-name">
                      {scheme.createdAt
                        ? scheme.createdAt.toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>
                    <td className=" s-name">
                      <Button
                        className="act-btn"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteScheme(scheme.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {selectedSection === "application" && (
        <>
          <h4 className=" h-name">User Applications</h4>
          {applications.length === 0 ? (
            <p className=" s-name">No user applications available.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className=" e-name">Name</th>
                  <th className=" e-name">Scheme Name</th>
                  <th className=" e-name">Staff Status</th>
                  <th className=" e-name">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="s-name">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="s-name">{app.schemeName}</td>
                    <td className="s-name">{app.staffStatus || "Pending"}</td>
                    <td className="d-flex gap-2 justify-content-center align-items-center">
                      <Button
                        className=" act-btn"
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewApplication(app)}
                      >
                        View
                      </Button>

                      {(!app.staffStatus || app.staffStatus === "Pending") && (
                        <>
                          <Button
                            className=" act-btn"
                            variant="success"
                            size="sm"
                            onClick={() => handleDecision(app.id, "Approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            className=" act-btn"
                            variant="danger"
                            size="sm"
                            onClick={() => handleDecision(app.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {selectedApplication && (
        <SchemeApplicationForm
          scheme={{
            id: selectedApplication.schemeId,
            name: selectedApplication.schemeName,
          }}
          onClose={handleCloseModal}
          readOnly={true}
          applicationData={selectedApplication}
        />
      )}
    </div>
  );
};

export default StaffDashboard;

// final
