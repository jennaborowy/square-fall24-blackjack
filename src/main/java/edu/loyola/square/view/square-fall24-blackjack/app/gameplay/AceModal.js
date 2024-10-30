import React from 'react';
import {Modal, Box, Button, Stack} from "@mui/material";
import DialogContentText from '@mui/material/DialogContentText';
const AceModal = ({onSelectValue, showModal}) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  return(
    <Modal
      open={showModal}
      disableEscapeKeyDown
      disableBackdropClick
      aria-labelledby="ace-value-modal"
      aria-describedby="choose-ace-value"
    >
      <Box sx={style}>
      <DialogContentText>
        You got an Ace!
      </DialogContentText>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            onClick={() => onSelectValue(1)}
            sx={{ minWidth: '100px' }}
          >
            1
          </Button>
          <Button
            variant="contained"
            onClick={() => onSelectValue(11)}
            sx={{ minWidth: '100px' }}
          >
            11
          </Button>
        </Stack>
      </Box>
    </Modal>
    );
  }
  export default AceModal;