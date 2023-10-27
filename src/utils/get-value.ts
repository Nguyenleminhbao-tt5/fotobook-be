import { Record } from "neo4j-driver";



const getValue = (ob:Record, key:String='n')=>{
    return ob.get(String(key)).properties;
}

export default getValue;