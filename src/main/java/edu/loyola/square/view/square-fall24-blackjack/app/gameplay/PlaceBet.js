import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
const BetInput = ({betValue, minimum, maximum, increment}) => {
  <InputGroup className="mb-3">
    <InputGroup.Text>$</InputGroup.Text>
    <Form.Control
      type="number"
      min=""
      max=""
      step=""
      value={betValue}
      onChange={setBetAmount}
      aria-label="Amount (to the nearest dollar)"/>

    <InputGroup.Text>.00</InputGroup.Text>
  </InputGroup>
}