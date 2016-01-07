

----------------------------------------------------------------------------------------------------
TREE
For GnpIS legacy Format. Moved to crop ontology trait ontology template.
....................................................................................................

Prefix : 
[
       
       
       
       
 Row Template : 
  
          {
      "id" : {{jsonize(cells["VariableID"].value)}},
      "text" : {{jsonize(cells["VariableName"].value)}},
      "parent" : {{if(isNull(cells["ParentVariable"]), "\"#\"" , jsonize(cells["ParentVariable"].value) )}},
      "data": 
		{
       "OntologyName" : {{jsonize(cells["OntologyName"].value)}},
      "VariableID" : {{jsonize(cells["VariableID"].value)}},
      "VariableName" : {{jsonize(cells["VariableName"].value)}}
      {{if(isNull(cells["VariableShortName"]), " " ,",\n\"VariableShortName\" : " + jsonize(cells["VariableShortName"].value)  )}}
      {{if(isNull(cells["ParentVariable"]), ",\n\"ParentVariable\" : \"#\"" ,",\n\"ParentVariable\" : " + jsonize(cells["ParentVariable"].value) )}}
      {{if(isNull(cells["Description"]), " " ,",\n\"Description\" : " + jsonize(cells["Description"].value) )}}
      {{if(isNull(cells["Unit"]), " " ,",\n\"Unit\" : " + jsonize(cells["Unit"].value) )}}
      {{if(isNull(cells["Protocol"]), " " ,",\n\"Protocol\" : " + jsonize(cells["Protocol"].value) )}}
      {{if(isNull(cells["Scale"]), " " ,",\n\"Scale\" : " + jsonize(cells["Scale"].value) )}}
      {{if(isNull(cells["ProtocolFile"]), " " ,",\n\"ProtocolFile\" : " + jsonize(cells["ProtocolFile"].value) )}}
      {{if(isNull(cells["ProtocolFilePage"]), " " ,",\n\"ProtocolFilePage\" : " + jsonize(cells["ProtocolFilePage"].value) )}}
      {{if(isNull(cells["Language"]), " " ,",\n\"Language\" : " + jsonize(cells["Language"].value) )}}
      {{if(isNull(cells["Ref_SameAs"]), " " ,",\n\"Ref_SameAs\" : " + jsonize(cells["Ref_SameAs"].value) )}}
      {{if(isNull(cells["Ref_SubClassOf"]), " " ,",\n\"Ref_SubClassOf\" : " + jsonize(cells["Ref_SubClassOf"].value) )}}
      {{if(isNull(cells["Entity"]), " " ,",\n\"Entity\" : " + jsonize(cells["Entity"].value) )}}
      {{if(isNull(cells["Quality"]), " " ,",\n\"Quality\" : " + jsonize(cells["Quality"].value) )}}
      }
    }
    
    
    
    
Suffixe:

  ]
