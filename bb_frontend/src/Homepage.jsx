import { useState, useEffect } from "react";
import Sections from "./components/Sections";
import { Link } from "react-router-dom";

function Homepage ({ sections }) {
    return (
        <div>
            <h1>HomePage</h1>
            <Sections sections={sections} />
        </div>
    )
}


export default Homepage;
