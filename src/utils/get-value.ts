import { Record } from "neo4j-driver";



const getValue = (ob:Record)=>{
    return ob.get('n').properties;
}

export default getValue;