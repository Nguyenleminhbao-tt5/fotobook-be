import neo4j from "neo4j-driver"

// Define the Neo4j connection parameters
const uri = `${process.env.URI_NEO4J}`; // Replace with your Neo4j URL
const user = 'neo4j'; // Replace with your Neo4j username
const password = `${process.env.PASSWORD_NEO4J}`; // Replace with your Neo4j password

// Create a Neo4j driver instance
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

if (driver){
    console.log("⚡️[server]: Connect neo4j database successfully");
}
else {
    console.log("⚡️[server]: Connect neo4j database failed")
}

const connect= driver.session()
export default connect;