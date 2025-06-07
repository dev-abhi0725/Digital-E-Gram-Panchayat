import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function SchemesModal({ open, onClose , openLoginModal}) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return; // fetch only when modal is open

    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "schemes"));
        const schemesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchemes(schemesList);
      } catch (error) {
        console.error("Error fetching schemes:", error);
      }
      setLoading(false);
    };

    fetchSchemes();
  }, [open]);

  const handleApply = () => {
    onClose();           // close the modal
    openLoginModal();  // navigate to login page
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="schemes-modal-title" className=" scheme-box">
      <Box sx={style}>
        <Typography id="schemes-modal-title" variant="h6" component="h2" mb={2}>
          Available Schemes
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : schemes.length === 0 ? (
          <Typography>No schemes available.</Typography>
        ) : (
          <List>
            {schemes.map((scheme) => (
              <ListItem
                key={scheme.id}
                secondaryAction={
                  <Button variant="contained" onClick={handleApply}>
                    Apply
                  </Button>
                }
              >
                <ListItemText
                  primary={scheme.name || "Unnamed Scheme"}
                  secondary={scheme.description || ""}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Modal>
  );
}


// final