import { SummaryContext } from "./Section";
import { useContext, useEffect } from "react";
import OpenAI from "openai";

const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;

// const articleSummary = () => {
//   const { articles } = useContext(SummaryContext);
//   const [summary, setSummary] = useState("");
// };
// useEffect(() => {
//   if (articles && articles.abstract) {
//     const fetchSummary = async () => {
//       try {
//         ;
//         setSummary(completion.choices[0].message.content);
//       } catch (error) {
//         console.error("Error fetching summary:", error);
//       }
//     };

//     fetchSummary();
//   }
// }, [articles]);

//  const description = "Gianmarco Soresi, a comedian, talking to the audience at Sesh Comedy in New York City. “To be a stand-up comedian in today’s world, you have to be a content machine,” he said. "

const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });


export default async function main({abstract}) {

  const completion = await openai.chat.completions.create({
              messages: [
                {
                  role: "user",
                  content: `Based on the abstract, ${abstract},find the related news article and summarize it maximum 400 words and understandable for a 8th grader and below`,
                },
              ],
              model: "gpt-3.5-turbo",
            })

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

