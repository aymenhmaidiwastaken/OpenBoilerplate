import { config } from "@/config";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function getSEO(props: SEOProps = {}) {
  const title = props.title ? `${props.title} | ${config.app.name}` : config.app.name;
  const description = props.description || config.app.description;
  const url = props.url || config.app.url;
  const image = props.image || `${config.app.url}/og-image.png`;

  return {
    title,
    description,
    url,
    image,
    type: props.type || "website",
    publishedTime: props.publishedTime,
    author: props.author,
    noindex: props.noindex || false,
  };
}
