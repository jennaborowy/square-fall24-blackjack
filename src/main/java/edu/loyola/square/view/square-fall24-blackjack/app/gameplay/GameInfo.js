import react from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const style = {
  py: 0,
  width: '100%',
  maxWidth: 360,
  //borderRadius: 2,
  //border: '6px solid',
  //borderColor: 'divider',
  backgroundColor: '#521818',
  opacity: 2
};

const divideStyle = {
  backgroundColor: "black"
};

const accordionStyle = {
  backgroundColor: '#521818',
  borderRadius: 1,
  border: '2px solid',
  borderColor: "black",
  color: "white"

}


export default function GameInfo() {
  return (
    <Accordion sx={accordionStyle} slotProps={{ heading: { component: 'h4' } }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{ color: 'white' }}
      >
        Current Game
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={divideStyle}/>
        <List sx={style}>
          <ListItem>
            <ListItemText primary="Bet:" primaryTypographyProps={{ color: 'white' }} />
          </ListItem>
          <Divider sx={divideStyle}/>
          <ListItem>
            <ListItemText primary="Winnings:" primaryTypographyProps={{ color: 'white' }}   />
          </ListItem>
          <Divider sx={divideStyle} />
          <ListItem>
            <ListItemText primary="Middle variant below" primaryTypographyProps={{ color: 'white' }} />
          </ListItem>
          <Divider sx={divideStyle} />
          <ListItem>
            <ListItemText primary="List item" primaryTypographyProps={{ color: 'white' }}  />
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );
}