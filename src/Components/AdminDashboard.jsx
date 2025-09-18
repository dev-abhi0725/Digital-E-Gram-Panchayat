// AdminDashboard.js
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Button, Table, Form, Card } from "react-bootstrap";
import SchemeApplicationForm from "../Components/SchemeForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App";

const AdminDashboard = () => {
  const db = getFirestore();

  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newScheme, setNewScheme] = useState("");
  const [selectedSection, setSelectedSection] = useState("view");
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchSchemes();

    const appsQuery = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const appsList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((app) => app.staffStatus === "Approved"); // only show staff-approved
      setApplications(appsList);
    });
    return () => unsubscribe();
  }, []);

  const fetchSchemes = async () => {
    const schemesQuery = query(
      collection(db, "schemes"),
      orderBy("createdAt", "desc")
    );
    const schemesSnapshot = await getDocs(schemesQuery);
    const schemesList = schemesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });
    setSchemes(schemesList);
  };

  const addScheme = async () => {
    if (newScheme.trim() === "") return;
    await addDoc(collection(db, "schemes"), {
      name: newScheme,
      createdAt: serverTimestamp(),
    });
    setNewScheme("");
    fetchSchemes();
    toast.success("Scheme created successfully!");
    setSelectedSection("view");
  };

  const deleteScheme = async (id) => {
    await deleteDoc(doc(db, "schemes", id));
    fetchSchemes();
    toast.success("Scheme deleted successfully!");
  };

  const handleApplication = async (id, adminStatus) => {
    const appRef = doc(db, "applications", id);
    await updateDoc(appRef, { adminStatus });
    setSelectedApplication(null);
    toast.success(`Application ${adminStatus} successfully!`);
  };

  return (
    <div className="container mt-2">
      <h2 className="mb-2 admintext">Admin Dashboard</h2>

      {/* Menu */}
      <div className="menu-bar">
        <div
          className="menu-item"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(!activeDropdown);
            setSelectedSection("view");
          }}
        >
          Schemes
          {activeDropdown && (
            <div className="dropdown-content">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSection("create");
                  setActiveDropdown(false);
                }}
              >
                Create
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSection("delete");
                  setActiveDropdown(false);
                }}
              >
                Delete
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSection("view");
                  setActiveDropdown(false);
                }}
              >
                View
              </div>
            </div>
          )}
        </div>
        <div
          className="menu-item"
          onClick={() => setSelectedSection("applications")}
        >
          User Applications
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <div className="mt-4">
        {/* View Schemes */}
        {selectedSection === "view" && (
          <Card>
            <Card.Body>
              <h4 className="h-name">Existing Schemes</h4>
              {schemes.length === 0 ? (
                <p>No schemes available.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th className="e-name">Scheme Name</th>
                      <th className="e-name">Date Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map((scheme) => (
                      <tr key={scheme.id}>
                        <td className="s-name">{scheme.name}</td>
                        <td className="s-name">
                          {scheme.createdAt
                            ? scheme.createdAt.toLocaleDateString("en-GB")
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Create Scheme */}
        {selectedSection === "create" && (
          <Card>
            <Card.Body>
              <h4 className="h-name">Add New Scheme</h4>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={newScheme}
                  onChange={(e) => setNewScheme(e.target.value)}
                  placeholder="Scheme name"
                />
                <Button variant="success" className="ms-2" onClick={addScheme}>
                  Add
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Delete Scheme */}
        {selectedSection === "delete" && (
          <Card>
            <Card.Body>
              <h4 className="h-name">Delete Schemes</h4>
              {schemes.length === 0 ? (
                <p className="e-name">No schemes available to delete.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th className="e-name">Scheme Name</th>
                      <th className="e-name">Date Created</th>
                      <th className="e-name">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map((scheme) => (
                      <tr key={scheme.id}>
                        <td className="s-name">{scheme.name}</td>
                        <td className="s-name">
                          {scheme.createdAt
                            ? scheme.createdAt.toLocaleDateString("en-GB")
                            : "N/A"}
                        </td>
                        <td className="s-name">
                          <Button
                            className="act-btn"
                            variant="danger"
                            onClick={() => deleteScheme(scheme.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Applications */}
        {selectedSection === "applications" && (
          <Card>
            <Card.Body>
              <h4 className="h-name">User Applications (Approved by Staff)</h4>
              {applications.length === 0 ? (
                <p className="e-name">No applications available.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th className="e-name">Name</th>
                      <th className="e-name">Scheme</th>
                      <th className="e-name">Admin Status</th>
                      <th className="e-name">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="s-name">
                          {app.firstName} {app.lastName}
                        </td>
                        <td className="s-name">{app.schemeName}</td>
                        <td className="s-name">
                          {app.adminStatus || "pending"}
                        </td>
                        <td className="d-flex gap-2 justify-content-center align-items-center">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            View
                          </Button>

                          {app.adminStatus !== "approved" &&
                            app.adminStatus !== "rejected" && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    handleApplication(app.id, "approved")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleApplication(app.id, "rejected")
                                  }
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
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Modal for viewing application details */}
      {selectedApplication && (
        <SchemeApplicationForm
          scheme={{
            id: selectedApplication.schemeId,
            name: selectedApplication.schemeName,
          }}
          applicationData={selectedApplication}
          readOnly={true}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
