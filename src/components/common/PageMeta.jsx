import { HelmetProvider, Helmet } from "react-helmet-async";
const PageMeta = ({
  title,
  description
}) => <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>;
const AppWrapper = ({ children }) => <HelmetProvider>{children}</HelmetProvider>;
var stdin_default = PageMeta;
export {
  AppWrapper,
  stdin_default as default
};
