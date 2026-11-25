// Fixed routes for the demonstrations and case documentation.
// Editable project titles, descriptions and order live in site/data/content.json.
export const projectFields = ["context","problem","goal","solution","features","tech","architecture","competencies","benefits","current","limitations"];
export const demoNames = {
  "ap-workflow":"AP Workflow Manager",
  "ap-analytics":"Accounts Payable Analytics",
  printhub:"PrintHub 3D"
};
export const documentedProjects = [...Object.keys(demoNames), "procurement"];