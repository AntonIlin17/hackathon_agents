import "./App.css";
import { useState } from "react";
import EMSForms from "./ui/EMSForms";
import LoginScreen from "./ui/LoginScreen";
import ChatAssistant from "./ui/ChatAssistant";

function App() {
  const [paramedic, setParamedic] = useState(null);

  if (!paramedic) {
    return <LoginScreen onLogin={setParamedic} />;
  }

  return (
    <>
      <EMSForms />
      <ChatAssistant paramedic={paramedic} />
    </>
  );
}

export default App;

