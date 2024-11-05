// const API_KEY = import.meta.env.VITE_API_KEY;
import { XMLParser } from "fast-xml-parser";

export async function getNYTArticles (section) {
    return fetch(`https://rss.nytimes.com/services/xml/rss/nyt/${section}.xml`)
        .then(response => response.text())
        .then(text => new XMLParser().parse(text))
       .then(data => data.rss.channel.item);
}