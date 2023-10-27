import { Record } from "neo4j-driver";
import getValue from "./get-value";

const getList = (records:Record[], key:String= 'n') =>{
    
    let list:Object[]=[];
    records.forEach( (record)=>{
        list.push(getValue(record,key));
    })
    return list;
}
export default getList;