import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Page from "./app/Page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page />} />
      </Routes>
    </BrowserRouter>
  );
}
