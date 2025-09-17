import React, { useState, useEffect } from "react";
import { Button, Card, Table, Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import SchemeApplicationForm from "../Components/SchemeForm/index";
import "../App";
import { MdEdit } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [availableSchemes, setAvailableSchemes] = useState([]);
  const [activeSection, setActiveSection] = useState("profile");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    gender: "",
    fatherName: "",
    motherName: "",
    phoneNumber: "",
    address: "",
    profilePicture: "",
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Load profile data
        const profileRef = doc(db, "userProfiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        // Load applications
        const appsQuery = query(
          collection(db, "applications"),
          where("userId", "==", user.uid)
        );
        const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
          const apps = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          apps.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          });
          setApplications(apps);
        });

        return () => unsubscribeApps();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // useEffect(() => {
  //   const schemesQuery = collection(db, "schemes");
  //   const unsubscribeSchemes = onSnapshot(schemesQuery, (snapshot) => {
  //     const schemesList = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
        
  //     }));
  //     setAvailableSchemes(schemesList);
  //   });
  //   return () => unsubscribeSchemes();
  // }, []);
  useEffect(() => {
  const schemesQuery = collection(db, "schemes");
  const unsubscribeSchemes = onSnapshot(schemesQuery, (snapshot) => {
    const schemesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort latest first
    schemesList.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });

    setAvailableSchemes(schemesList);
  });
  return () => unsubscribeSchemes();
}, []);


  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out.");
    });
  };

  const handleApply = (scheme) => {
    if (!profile || !isProfileComplete()) {
      alert("Please complete your profile before applying to schemes.");
      setActiveSection("profile");
      return;
    }
    setSelectedScheme(scheme);
  };

  const isProfileComplete = () => {
    return (
      profile &&
      profile.name &&
      profile.gender &&
      profile.fatherName &&
      profile.motherName &&
      profile.phoneNumber &&
      profile.address &&
      profile.profilePicture
    );
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    if (
      !profileForm.name ||
      !profileForm.gender ||
      !profileForm.fatherName ||
      !profileForm.motherName ||
      !profileForm.phoneNumber ||
      !profileForm.address ||
      !profileForm.profilePicture
    ) {
      alert("Please fill out all profile fields.");
      return;
    }

    const profileData = {
      ...profileForm,
      email: user.email,
    };
    await setDoc(doc(db, "userProfiles", user.uid), profileData);
    setProfile(profileData);
    setEditingProfile(false);
  };

  const computeStatus = (app) => {
    const staff = app.staffStatus?.toLowerCase();
    const admin = app.adminStatus?.toLowerCase();

    if (staff === "rejected" || admin === "rejected") return "Rejected";
    if (staff === "approved" && (!admin || admin === "")) return "Pending";
    if (staff === "approved" && admin === "rejected") return "Rejected";
    if (staff === "approved" && admin === "approved") return "Approved";

    return "Pending";
  };

  return (
    <div className="container mt-4">
      <h2 className="admintext">User Dashboard</h2>

      {/* Section Toggle */}
      <div className=" gap-2 mb-3 menu-bar mm-btn">
        <Button className="menu-item b-bt n-btn"
          onClick={() => setActiveSection("profile")}
        >
          Profile
        </Button>
        <Button className="menu-item b-bt n-btn"
          onClick={() => setActiveSection("schemes")}
        >
          Available Schemes
        </Button>
        <Button className="menu-item b-bt n-btn"
          onClick={() => setActiveSection("history")}
        >
          Application Status
        </Button>
        <Button className="menu-item b-bt n-btn"
          onClick={() => setActiveSection("status")}
        >
          Application History
        </Button>
      </div>

  {/* Profile Section */}
{activeSection === "profile" && (
  <Card className="mt-3 profile-card text-center">
    <Card.Body>
      <h4 className="h-name mb-3">Profile</h4>

      {/* Avatar */}
      {/* Avatar */}
{/* Avatar */}
<div className="mb-3 position-relative d-inline-block">
  <label htmlFor="profilePictureInput" className="profile-avatar-label">
    {profileForm.profilePicture || profile?.profilePicture ? (
      <img
        src={profileForm.profilePicture || profile?.profilePicture}
        alt="Profile"
        className="profile-avatar"
      />
    ) : (
      <div className="profile-avatar placeholder-avatar">
        <FaUserCircle className="placeholder-icon" />
      </div>
    )}

    {/* ✅ Show edit icon if in edit mode OR no profile yet */}
    {editingProfile || !profile ? (
      <div className="edit-icon">
        <MdEdit />
      </div>
    ) : null}
  </label>

  {/* ✅ Allow file selection if editing OR no profile yet */}
  {(editingProfile || !profile) && (
    <input
      type="file"
      id="profilePictureInput"
      style={{ display: "none" }}
      onChange={handleProfilePictureChange}
    />
  )}
</div>



      {/* Details */}
      <div className="profile-details text-start mx-auto" style={{ maxWidth: "500px" }}>
        {profile && !editingProfile ? (
          <div>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Gender:</strong> {profile.gender}</p>
            <p><strong>Father's Name:</strong> {profile.fatherName}</p>clear
            <p><strong>Mother's Name:</strong> {profile.motherName}</p>
            <p><strong>Phone:</strong> {profile.phoneNumber}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Address:</strong> {profile.address}</p>
            <Button className="b-bt menu-item" onClick={() => {
              setEditingProfile(true);
              setProfileForm(profile);
            }}>
              Edit
            </Button>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={profileForm.gender}
                onChange={handleProfileInputChange}
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Father's Name</Form.Label>
              <Form.Control
                type="text"
                name="fatherName"
                value={profileForm.fatherName}
                onChange={handleProfileInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mother's Name</Form.Label>
              <Form.Control
                type="text"
                name="motherName"
                value={profileForm.motherName}
                onChange={handleProfileInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleProfileInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                name="address"
                value={profileForm.address}
                onChange={handleProfileInputChange}
                required
              />
            </Form.Group>
            <p><strong>Email:</strong> {user?.email}</p>
            <Button className="menu-item b-bt" onClick={saveProfile}>
              {profile ? "Update" : "Save"}
            </Button>
          </Form>
        )}
      </div>
    </Card.Body>
  </Card>
)}



      {/* Available Schemes */}
      {activeSection === "schemes" && (
        <Card className="mt-3">
          <Card.Body>
            <h4 className="h-name">Available Schemes</h4>
            {availableSchemes.length === 0 ? (
              <p className="e-name">No schemes available right now.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="e-name">Name</th>
                    {/* <th className="s-name">Description</th> */}
                    <th className="e-name">Created On</th>
                    <th className="e-name">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSchemes.map((scheme) => (
                    <tr key={scheme.id}>
                      <td className="s-name">{scheme.name}</td>
                      {/* <td className="e-name">{scheme.description}</td> */}
                      <td className="s-name">
                        {scheme.createdAt
                          ? scheme.createdAt.toDate().toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                      <td className="s-name">
                        <Button className="act-btn"
                          variant="success"
                          onClick={() => handleApply(scheme)}
                        >
                          Apply
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

      {/* Application Status */}
      {activeSection === "history" && (
        <Card className="mt-3">
          <Card.Body>
            <h4 className="h-name">Application Status</h4>
            {applications.length === 0 ? (
              <p className="e-name">No applications yet.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="e-name">Scheme</th>
                    {/* <th className="e-name">Status</th> */}
                    <th className="e-name">Date Submitted</th>
                    <th className="e-name">Staff Status</th>
                    <th className="e-name">Admin Status</th>
                    <th className="e-name">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="s-name">{app.schemeName}</td>
                      {/* <td className="s-name">{computeStatus(app)}</td> */}
                      <td className="s-name">
                        {app.createdAt
                          ? app.createdAt.toDate().toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                      <td className="s-name">{app.staffStatus || "Pending"}</td>
                      <td className="s-name">
                        {app.staffStatus?.toLowerCase() === "rejected"
                          ? "Rejected"
                          : app.adminStatus || "Pending"}
                      </td >
                      <td className="s-name">
                        <Button className="act-btn"
                          variant="info"
                          onClick={() => setSelectedApplication(app)}
                        >
                          View
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

      {/* Application History */}
      {activeSection === "status" && (
        <Card className="mt-3">
          <Card.Body>
            <h4 className="h-name">Application History</h4>
            {applications.length === 0 ? (
              <p className="e-name">No application history.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="e-name">Scheme</th>
                    <th className="e-name">Status</th>
                    <th className="e-name">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="s-name">
                          {app.schemeName}
                      </td>
                      <td className="s-name">{computeStatus(app)}</td>
                      <td className="s-name">
                        <Button className="act-btn"
                          variant="info"
                          onClick={() => setSelectedApplication(app)}
                        >
                          View
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <SchemeApplicationForm
          scheme={{ name: selectedApplication.schemeName }}
          applicationData={selectedApplication}
          readOnly={true}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Application Form Modal */}
      {selectedScheme && (
        <SchemeApplicationForm
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;


// final code