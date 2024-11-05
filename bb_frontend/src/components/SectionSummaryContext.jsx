import { useContext } from "react";
import { SummaryContext } from "./Section";
import { useLocation } from "react-router-dom";

const SectionSummaryContext = () => {
    const location = useLocation();
    const data = location.state;
    const { article, summary } = data;
    console.log(article, summary);
    // console.log(summary);

    return (
        <div>  {summary} </div>

    )
}

export default SectionSummaryContext