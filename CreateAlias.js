/**************************************************************
Github - https://github.com/xCruziX/ioBroker-Creating-Alias/blob/master/CreateAlias.js
				Changelog
Version 1.1.5
- added flag for correcting source id

Version 1.1.4
- fix error by using bCreateAliasPath and bConvertExistingPath (has no target 9/Error creating alias-path)

Version 1.1.3
  - use callbacks in alias-path
  
**************************************************************/

/**************************************
		Flags /
		Variablen
***************************************/

// typeAlias = 'boolean'; // oder 'number'
// read = "val == 'Ein' ? true : false"; // Erkennung "Aus" --> false erfolgt automatisch  
// write = "val ? 'Ein' : 'Aus'";
// nameAlias = 'Licht Haustür';
// role = 'switch';
// desc = 'per Script erstellt';
// min = 0; // nur Zahlen
// max = 100; // nur Zahlen
// unit = '%'; // nur für Zahlen
// states = {0: 'Aus', 1: 'Auto', 2: 'Ein'}; // Zahlen (Multistate) oder Logikwert (z.B. Aus/Ein)
 
 
let bCreateAliasPath = false;  // If this flag is true, each folder is created seperately so rooms and functions can be assigned.

/*
Requirements: bCreateAliasPath == true
If this flag is true, existing folders in the path will be converted so rooms and functions can be assigned.
*/
let bConvertExistingPath = false;

/*
If the alias already exists and there is a difference between the new source id and the source id in the existing alias,
the source id will be changed.
This can be used for changing the source ids of an alias, for example for a devices change.
*/
let bCorrectSource = false;

/***************************************
		Dont't change anything from here /
		Ab hier nichts verändern
***************************************/

let arEnum = [];
let arId = [];
let timeoutAssignEnum;
var callbackAlias = undefined;
function createAlias(idSrc, idDst,raum, gewerk,typeAlias, read, write, nameAlias, role, desc, min, max, unit, states) {
  if(!idDst.includes('alias.0.'))
      idDst = 'alias.0.' + idDst;
  if(!existsObject(idSrc))
  {
      log('Source-Id ' + idSrc +' does not exists.','warn');
      return;
  }
  
  // Create the object Path for alias id, 
  // so you can assign rooms and function to the parents
  var createAliasPath = (id) => {
       if(bCreateAliasPath){
            let lisMergedIds = [];
            let mergedId = 'alias.0';
            id = id.replace(mergedId + '.', ''); // Remove prefix alias so it will not be changed
            let split = id.split('.'); 
            for(let i=0;i<split.length-1;i++){
                mergedId += '.' + split[i];
                lisMergedIds.push(mergedId);
            }
            
            function path(){
                if(lisMergedIds.length == 0) {// Zu Ende erstellt
                    alias();
                    return;
                }
                let tmpId = lisMergedIds[0];
                lisMergedIds.splice(0,1); // entferne element
                if(!existsObject(tmpId) || bConvertExistingPath){ // not exists
                    let obj;
                    if(existsObject(tmpId))
                        obj = getObject(tmpId);
                    else
                        obj = {};

                    let bApply = false;
                    if(obj != undefined){
                        if(obj.type == undefined || String(obj.type) != 'meta'){
                            obj.type = 'folder';
                            bApply = true;
                        }
                        if(obj.common == undefined){
                            obj.common = {};
                            obj.common.type = 'meta.folder';
                            bApply = true;
                        }
                        else if(obj.common.type == undefined || String(obj.common.type) != 'meta.folder'){
                            obj.common.type = 'meta.folder';
                            bApply = true;
                        }
                        if(obj.native == undefined){
                            obj.native = {};
                            bApply = true;
                        }
                    }
                    else{
                        path();
                        log('Object is undefined');
                        return;
                    }
                    

                    if(bApply){
                        setObject(tmpId, obj, (err) =>{
                        if(!err){
                            log('Created Alias-Path ' + tmpId);
                            path();
                        }
                        else
                            log('Error creating alias-path','error');
                    });
                    }
                    else
                        path();
                    
                }
            }
            path();
       }
       else
         alias();
  }
  
  
  function alias(){
      // Create alias object
      
        if(!existsObject(idDst)){
            let obj = {};
            obj.type = 'state';
            obj.common = getObject(idSrc).common;
            obj.common.alias = {};
            obj.common.alias.id = idSrc;
            if(typeAlias !== undefined) 
                obj.common.type = typeAlias;
            if(obj.common.read !== undefined) 
                obj.common.alias.read = read;
            if(obj.common.write !== undefined) 
                obj.common.alias.write = write;
            if(nameAlias !== undefined) 
                obj.common.name = nameAlias;
            if(role !== undefined) 
                obj.common.role = role;
            if(desc !== undefined) 
                obj.common.desc = desc;
            if(min !== undefined) 
                obj.common.min = min;
            if(max !== undefined) 
                obj.common.max = max;
            if(unit !== undefined) 
                obj.common.unit = unit;
            if(states !== undefined) 
                obj.common.states = states;

            obj.native = {};
            obj.common.custom = []; // Damit die Zuordnung zu iQontrol, Sql etc. nicht übernommen wird
            log('Created Alias-State ' + idDst);
            setObject(idDst, obj,(err) =>{ 
                if(!err)
                    startAttach(); 
                else
                    log('Error creating-alias','error');
            });
        }
        else if(bCorrectSource){
            // Check the Source ID
            // log('Checking Sourcepath');
            let obj = getObject(idDst);
            if(obj != undefined && obj.common != undefined && obj.common.alias != undefined && obj.common.alias.id != undefined
            && obj.common.alias.id != idSrc){
                let before = obj.common.alias.id;
                obj.common.alias.id = idSrc;
                setObject(idDst, obj,(err) =>{ 
                    if(!err){
                        log(idDst + ': Correcting Sourcepath from \''  + before + '\' to \'' +  idSrc + '\'');
                        startAttach(); 
                    }
                    else
                        log('Error correcting path','error');
                    });
            }
            else
                startAttach();
        }
        else
            startAttach();
  }
  
  
  // Save ID and Enum (room or function)
  var attach = (id, enu,value) => {
      if(id.length == 0){
          log('ID has lenght 0, can not attach to enum','warn');
          return;
      }
      if(value.length == 0){
          log('Value has lenght 0','warn');
          return;
      }
    
      let sEnuId = 'enum.' + enu + '.' + value;
      if(enu.length > 0 && existsObject(sEnuId)) 
      {
          let obj = getObject(sEnuId)
          let members = obj.common.members;
          if(!members.includes(id)){
              arEnum.push(sEnuId);
              arId.push(id);
          }
      }
      else
   	      log('Can not find enum ' + sEnuId,'warn');
  }
 
 function startAttach(){
    let bRoom = raum !== undefined && raum.length > 0;
    let bGewerk = gewerk !== undefined && gewerk.length > 0;
    
    if(bRoom)
        attach(idDst,'rooms',raum);
    if(bGewerk)
        attach(idDst,'functions',gewerk);
    if(bRoom || bGewerk){
            if(timeoutAssignEnum){
                clearTimeout(timeoutAssignEnum);
                timeoutAssignEnum = null;
            }
            timeoutAssignEnum = setTimeout(finishScript,100);
    }
 }
 
  createAliasPath(idDst);
}

function finishScript(){
	assignEnums();
}

// Add the saved IDs to the rooms/functions
function assignEnums(){
 if(arEnum.length == 0 || arId.length == 0){
      return;
 }

 if(arEnum.length != arId.length){
      log('Arrays have different size','error');
      return;
 }
 let mapEnumId = new Map();
 
 for(let i=0;i < arEnum.length; i++){
     let enu = arEnum[i];
     let id = arId[i];
     if(existsObject(id)){
    	 let obj = getObject(enu)
    	 let members;
    	 if(!mapEnumId.has(enu)){
    		 members = obj.common.members;
    		 mapEnumId.set(enu,members);
    	 }
    	 else
    		 members = mapEnumId.get(enu);    
    	 if(!members.includes(id)){
    		  log("Adding " + id + " to " + enu);
    		  members.push(id);
    	 }	      
     }
     else
         log('Can not find Alias ' + id,'error');
 }
  
  function setMembers(members,enu,map){
      let obj = getObject(enu);
      obj.common.members = members;
      setObject(enu,obj);
  }
  mapEnumId.forEach(setMembers);
}
