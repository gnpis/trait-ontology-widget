CAUTION: this is a development tool for quick and dirty test data generation. Likely not suitable for production

----------------------------------------------------------------------------------------------------
1/ Categrories and ontology root.
....................................................................................................
Ontology root: single Node by hande.
Same for category 

----------------------------------------------------------------------------------------------------
2/ handle traits. Can't handle traits with multiple variable
....................................................................................................

Prefix : 
[    
 Row Template :   
    {
      "id" : {{jsonize(cells["Trait ID"].value)}},
      "text" : {{jsonize(cells["Trait"].value)}},
      "parent" : {{ jsonize(cells["Trait class"].value) )}},
      "data": 
		{
	      "OntologyName" : {{jsonize(cells["Crop"].value)}},
	      "Trait ID" : {{jsonize(cells["Trait ID"].value)}},
	      "Trait" : {{jsonize(cells["Trait"].value)}},
	      {{if(isNull(cells["Main trait abbreviation"]), " " ,",\n\"Main trait abbreviation\" : " + jsonize(cells["Main trait abbreviation"].value)  )}}
	      {{if(isNull(cells["Alternative trait abbreviations"]), " " ,",\n\"Alternative trait abbreviations\" : " + jsonize(cells["ParentVariable"].value) )}}
	      {{if(isNull(cells["Trait description"]), " " ,",\n\"Trait description\" : " + jsonize(cells["Trait description"].value) )}}
	      {{if(isNull(cells["Trait synonyms"]), " " ,",\n\"Trait synonyms\" : " + jsonize(cells["Trait synonyms"].value) )}}
	      {{if(isNull(cells["Entity"]), " " ,",\n\"Entity\" : " + jsonize(cells["Entity"].value) )}}
	      {{if(isNull(cells["Attribute"]), " " ,",\n\"Attribute\" : " + jsonize(cells["Attribute"].value) )}}
	      {{if(isNull(cells["Trait status"]), " " ,",\n\"Trait status\" : " + jsonize(cells["Trait status"].value) )}}
	      {{if(isNull(cells["Trait Xref"]), " " ,",\n\"Trait Xref\" : " + jsonize(cells["Trait Xref"].value) )}}
	      {{if(isNull(cells["Language"]), " " ,",\n\"Language\" : " + jsonize(cells["Language"].value) )}}
      }
    }    
Suffixe:
  ]

----------------------------------------------------------------------------------------------------
3/ handle variables.
....................................................................................................

Prefix : 
	[    
	 Row Template :   
	    {
	      "id" : {{jsonize(cells["Variable ID"].value)}},
	      "text" : {{jsonize(cells["Variable full name"].value)}},
	      "parent" : {{ jsonize(cells["Trait ID"].value) )}},
	      "data": 
			{
		      "OntologyName" : {{jsonize(cells["Crop"].value)}},
		      "Trait ID" : {{jsonize(cells["Trait ID"].value)}},
		      "Variable ID" : {{jsonize(cells["Variable ID"].value)}},
		      "Trait" : {{jsonize(cells["Trait"].value)}},
		      "Variable full name" : {{jsonize(cells["Variable full name"].value)}}
		      {{if(isNull(cells["Language"]), " " ,",\n\"Language\" : " + jsonize(cells["Language"].value) )}}
		      {{if(isNull(cells["Variable name (Short Name)"]), " " ,",\n\"Variable name\" : " + jsonize(cells["Variable name"].value)  )}}
		      {{if(isNull(cells["Variable synonyms"]), " " ,",\n\"Variable synonyms\" : " + jsonize(cells["Variable synonyms"].value) )}}
		      {{if(isNull(cells["Trait description"]), " " ,",\n\"Trait description\" : " + jsonize(cells["Trait description"].value) )}}
		      {{if(isNull(cells["Growth stage"]), " " ,",\n\"Growth stage\" : " + jsonize(cells["Growth stage"].value) )}}
		      {{if(isNull(cells["Method ID"]), " " ,",\n\"Method ID\" : " + jsonize(cells["Method ID"].value) )}}
		      {{if(isNull(cells["Method"]), " " ,",\n\"Method\" : " + jsonize(cells["Method"].value) )}}
		      {{if(isNull(cells["Method class"]), " " ,",\n\"Method class\" : " + jsonize(cells["Method class"].value) )}}
		      {{if(isNull(cells["Method description"]), " " ,",\n\"Method description\" : " + jsonize(cells["Method description"].value) )}}
		      {{if(isNull(cells["Formula"]), " " ,",\n\"Formula\" : " + jsonize(cells["Formula"].value) )}}
		      {{if(isNull(cells["Method reference"]), " " ,",\n\"Method reference\" : " + jsonize(cells["Method reference"].value) )}}
		      {{if(isNull(cells["Scale ID"]), " " ,",\n\"Scale ID\" : " + jsonize(cells["Scale ID"].value) )}}
		      {{if(isNull(cells["Scale name"]), " " ,",\n\"Scale name\" : " + jsonize(cells["Scale name"].value) )}}
		      {{if(isNull(cells["Scale class"]), " " ,",\n\"Scale class\" : " + jsonize(cells["Scale class"].value) )}}
		      {{if(isNull(cells["Decimal places"]), " " ,",\n\"Decimal places\" : " + jsonize(cells["Decimal places"].value) )}}
		      {{if(isNull(cells["Lower limit"]), " " ,",\n\"Lower limit\" : " + jsonize(cells["Lower limit"].value) )}}
		      {{if(isNull(cells["Upper limit"]), " " ,",\n\"Upper limit\" : " + jsonize(cells["Upper limit"].value) )}}
		      {{if(isNull(cells["Scale Xref"]), " " ,",\n\"Scale Xref\" : " + jsonize(cells["Scale Xref"].value) )}}
		      {{if(isNull(cells["Category 1"]), " " ,",\n\"Category 1\" : " + jsonize(cells["Category 1"].value) )}}
		      {{if(isNull(cells["Category 2"]), " " ,",\n\"Category 2\" : " + jsonize(cells["Category 2"].value) )}}
		      {{if(isNull(cells["Category 3"]), " " ,",\n\"Category 3\" : " + jsonize(cells["Category 3"].value) )}}
		      {{if(isNull(cells["Category 4"]), " " ,",\n\"Category 4\" : " + jsonize(cells["Category 4"].value) )}}
	      }
	    }    
	Suffixe:
	  ]