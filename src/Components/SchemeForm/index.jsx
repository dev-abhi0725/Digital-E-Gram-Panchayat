// SchemeApplicationForm.js
import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

const SchemeApplicationForm = ({ scheme, onClose, readOnly = false, applicationData }) => {
  const db = getFirestore();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    category: "",
    fatherName: "",
    motherName: "",
    dob: "",
    aadharNumber: "",
    phoneNumber: "",
    email: "",
    corrAddress: "",
    corrCity: "",
    corrDistrict: "",
    corrState: "",
    corrPincode: "",
    permAddress: "",
    permCity: "",
    permDistrict: "",
    permState: "",
    permPincode: "",
    applicantPicture: null,
    documentPicture: null,
    declaration: false,
  });

  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    if (readOnly && applicationData) {
      setFormData((prev) => ({
        ...prev,
        ...applicationData,
      }));
    }
  }, [readOnly, applicationData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (readOnly) return;

    if (type === "checkbox") {
      if (name === "sameAddress") {
        setSameAddress(checked);
        if (checked) {
          setFormData((prev) => ({
            ...prev,
            permAddress: prev.corrAddress,
            permCity: prev.corrCity,
            permDistrict: prev.corrDistrict,
            permState: prev.corrState,
            permPincode: prev.corrPincode,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            permAddress: "",
            permCity: "",
            permDistrict: "",
            permState: "",
            permPincode: "",
          }));
        }
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "my_unsigned_preset");
    data.append("cloud_name", "doh9dqcva");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/doh9dqcva/image/upload",
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (readOnly) return;

    if (!formData.declaration) {
      alert("Please accept the declaration before submitting.");
      return;
    }

    const auth = getAuth();
    if (!auth.currentUser) {
      alert("You must be logged in to submit the form.");
      return;
    }

    try {
      let applicantPictureUrl = null;
      let documentPictureUrl = null;

      if (formData.applicantPicture) {
        applicantPictureUrl = await uploadToCloudinary(formData.applicantPicture);
      }
      if (formData.documentPicture) {
        documentPictureUrl = await uploadToCloudinary(formData.documentPicture);
      }

      const dataToSave = {
        ...formData,
        applicantPicture: applicantPictureUrl,
        documentPicture: documentPictureUrl,
        userId: auth.currentUser.uid,
        schemeId: scheme.id,
        schemeName: scheme.name,
        status: "pending",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "applications"), dataToSave);
      alert("Form data saved to Firestore!");
      onClose();
    } catch (error) {
      console.error("Error saving form data:", error);
      alert("Error submitting form. Please try again later.");
    }
  };

  if (!scheme) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content m-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {readOnly ? "View Application" : `Apply for: ${scheme?.name}`}
            </h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h5 className="mb-3">Personal Details</h5>
            <Row className="mb-2">
              <Col>
                <Form.Label>First Name</Form.Label>
                <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} disabled={readOnly} required/>
              </Col>
              <Col>
                <Form.Label>Middle Name</Form.Label>
                <Form.Control name="middleName" value={formData.middleName} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>Last Name</Form.Label>
                <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} disabled={readOnly} required/>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" value={formData.gender} onChange={handleChange} disabled={readOnly} required>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange} disabled={readOnly} required>
                <option value="">Select</option>
                  <option>OBC</option>
                  <option>ST</option>
                  <option>SC</option>
                  <option>General</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Form.Label>Father's Name</Form.Label>
                <Form.Control name="fatherName" value={formData.fatherName} onChange={handleChange} disabled={readOnly} required/>
              </Col>
              <Col>
                <Form.Label>Mother's Name</Form.Label>
                <Form.Control name="motherName" value={formData.motherName} onChange={handleChange} disabled={readOnly} required />
              </Col>
              <Col>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} disabled={readOnly} required/>
              </Col>
            </Row>

            <h5 className="mt-3">Correspondence Address</h5>
            <Row className="mb-2">
              <Col>
                <Form.Label>Address</Form.Label>
                <Form.Control name="corrAddress" value={formData.corrAddress} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>City/Town/Village</Form.Label>
                <Form.Control name="corrCity" value={formData.corrCity} onChange={handleChange} disabled={readOnly} />
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Form.Label>District</Form.Label>
                <Form.Control name="corrDistrict" value={formData.corrDistrict} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>State</Form.Label>
                <Form.Control name="corrState" value={formData.corrState} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>Pincode</Form.Label>
                <Form.Control name="corrPincode" value={formData.corrPincode} onChange={handleChange} disabled={readOnly} />
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="Permanent address same as correspondence address"
              name="sameAddress"
              checked={sameAddress}
              onChange={handleChange}
              disabled={readOnly}
              className="mb-2"
            />

            <h5>Permanent Address</h5>
            <Row className="mb-2">
              <Col>
                <Form.Label>Address</Form.Label>
                <Form.Control name="permAddress" value={formData.permAddress} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label >City/Town/Village</Form.Label>
                <Form.Control name="permCity" value={formData.permCity} onChange={handleChange} disabled={readOnly} />
              </Col>
            </Row>
            <Row className="mb-2">
              <Col>
                <Form.Label>District</Form.Label>
                <Form.Control name="permDistrict" value={formData.permDistrict} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>State</Form.Label>
                <Form.Control name="permState" value={formData.permState} onChange={handleChange} disabled={readOnly} />
              </Col>
              <Col>
                <Form.Label>Pincode</Form.Label>
                <Form.Control name="permPincode" value={formData.permPincode} onChange={handleChange} disabled={readOnly} />
              </Col>
            </Row>

            <h5 className="mt-3">Proofs</h5>
            <Row className="mb-2">
              <Col>
                <Form.Label>Upload Picture of Applicant</Form.Label>
                {readOnly && formData.applicantPicture ? (
                  <a href={formData.applicantPicture} target="_blank" rel="noopener noreferrer">View Picture</a>
                ) : (
                  <Form.Control type="file" name="applicantPicture" onChange={handleChange} disabled={readOnly} required/>
                )}
              </Col>
              <Col>
                <Form.Label>Upload Aadhaar Card Picture(Only Image)</Form.Label>
                {readOnly && formData.documentPicture ? (
                  <a href={formData.documentPicture} target="_blank" rel="noopener noreferrer">View Document</a>
                ) : (
                  <Form.Control type="file" name="documentPicture" onChange={handleChange} disabled={readOnly} required/>
                )}
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="I hereby declare that the information provided is true."
              name="declaration"
              checked={formData.declaration}
              onChange={handleChange}
              disabled={readOnly}
              className="mt-3"
            />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {!readOnly && (
              <Button variant="primary" onClick={handleSubmit}>Submit</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeApplicationForm;
