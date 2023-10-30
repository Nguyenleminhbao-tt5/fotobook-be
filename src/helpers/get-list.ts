import { Record } from "neo4j-driver";
import getValue from "./get-value";

const getList = async (records:Record[], key:String= 'n', isCollect: Boolean=false) =>{
    
    if(records && isCollect == false)
    {
        let list:Object[]=[];
        records.forEach( (record)=>{
            list.push( getValue(record,key));
        })
        return list;
    } 
    else if (records && isCollect ){
        let list:Object[][]=[];
        records.forEach( (record)=>{
            let childList:Object[]=[];
            record.get(String(key)).forEach( (value:any)=>{
                childList.push(value.properties)
            })
            list.push( childList)
            
        })
        return list;
    }
    else{
        return [];
    }
    
}
export default getList;