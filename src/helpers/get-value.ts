import { Record } from "neo4j-driver";



const getValue =  (record:Record, key:String='n')=>{
    return  record.get(String(key)).properties;
}

export default getValue;