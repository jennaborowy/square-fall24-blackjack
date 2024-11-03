import { TypeAnimation } from 'react-type-animation';
import './card.css'
const PlaceBetAnimation = () => {
  return (
    <TypeAnimation
      sequence={[
        'Place Your Bet!',
          2000,
      ]}
      wrapper="span"
      speed={35}
      style={{
        color: 'white',
        textDecoration: 'none'
      }}
      //gets rid of cursor when animation is done
      cursor={false}
      />
  );
};
export default PlaceBetAnimation;