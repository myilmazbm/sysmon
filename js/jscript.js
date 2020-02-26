$(document).ready(function () {
    gettable("http://sysmon.fintek.local:5000/api", "Gosterges", function(){});
    $("#Dr").append(fillSearch(["Sistems","Sayacs"],false));
    $('.searchlink').click(function(event){
        //alert("clickt");
		event.preventDefault();
		// CALL Table
        if(Array.isArray(tableschema[$(this).attr('data-name')]))  { 
            Array.isArray(tableschema[$(this).attr('data-name')].push($(this).val()))
        }
        else {
            tableschema[$(this).attr('data-name')]=[$(this).text()];
        }
        ShowingModal("Tablo Oluşturma", CreateTable(tableschema,"Gosterges"), "İptal", "Tamam",TabloEkle );
	});
});

var tableschema={};
var CurrentPanel="ZB";
var SistemsTable = JSON.parse(window.localStorage.getItem("Sistems"));
var SayacsTable = JSON.parse(window.localStorage.getItem("Sayacs"));


function rightClickEvent(cs){
	document.onclick = function(event) {
        document.getElementById("rmenu").classList.add("invisible");
    }
	document.getElementsByTagName(cs).oncontextmenu = function(e) {
		document.getElementById("rmenu").classList.remove("invisible");
		document.getElementById("rmenu").style.top =  e.clientY + 'px';
		document.getElementById("rmenu").style.left = e.clientX + 'px';
		e.preventDefault();
	}
}rightClickEvent("body");

function fillRightClick(data){
	result='<ul class=" list-group bg-info">';
	for( i in data ){
		result+='<li class="list-group-item">';
		result+='<a '+data[i]+' >'+Object.keys(data)[i]+'</a>';
		result+='</li>';
	}
	result+='</ul>';
	$('#rmenu').html(result);
}

function GetHeaders(obj) {
    var cols = []
    var p = obj;
    for (var key in p) {
        //alert(' name=' + key + ' value=' + p[key]);
        cols.push(key);
    }
    return cols;
}

function filterinput() {
    $("input.filter-input").keyup(function () {
        var value = $(this).val().toLowerCase();
        $(this).parent().find("a").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
}filterinput();

function searchlinkclick(link,dataName,dataText){
    
    if(!link){
        tableschema={};
    }
    if(Array.isArray(tableschema[dataName]))  { 
        Array.isArray(tableschema[dataName].push(dataText))
    }
    else {
        tableschema[dataName]=[dataText];
    }
    ShowingModal("Tablo Oluşturma", CreateTable(tableschema,"Gosterges"), "İptal", "Tamam",TabloEkle );
}

function TabloEkle(panel){
    var Tablolar = JSON.parse(window.localStorage.getItem("Tablolar"));
    if ( Tablolar == null ){
        Tablolar = {}
    }
    if (Tablolar[panel] == null){
        Tablolar[panel] = []
    }
    Tablolar[panel].push(JSON.stringify(tableschema));
    window.localStorage.setItem("Tablolar",  JSON.stringify(Tablolar));
}

function fillSearch(data,link=true) {
    
    var result = "";
    for (x in data) {
        result += '<h5 class="dropdown-header">' + data[x] + '</h5>';
        result += GetListFromStorage(data[x], "isim", "a",link);
    }
    //alert(result);
    return result;
}
function GetListFromStorage(dataName, dataColumn, tagName,link=false) {
    var data = JSON.parse(window.localStorage.getItem(dataName));
    //var header = GetHeaders(data[0]);
    var result = '';
    for (x in data) {
        result += "<" + tagName + " class='dropdown-item "+((link)?"searchlink":"")+"' onclick='searchlinkclick("+link.toString()+",\""+dataName+"\",\""+data[x][dataColumn]+"\");' data-name='"+dataName+"' data-column='"+dataColumn+"'>" + data[x][dataColumn] + "</" + tagName + ">";
    }
    //alert(result);
    return result;
}


function gettable(url,Name, callback) {
    if (Name == "") {
        return;
    }
    $.ajax({
        type: 'GET',
        url: url+((url[url.length - 1] == '/')? '' : '/') +Name,
        dataType: 'json',
        success: function (data) {
            //alert(JSON.stringify(data));
            window.localStorage.setItem(Name, JSON.stringify(data));
            callback();
        },
        failure: function (data) {
            alert("Yükleme Başarısız: " + data.responseText);
        }, //End of AJAX failure function  
        error: function (data) {
            alert("Yükleme Hatası: " + data.responseText);
            callback();
        } //End of AJAX error function  
    });
}

function CreateTable(schema,Name){
    var data = JSON.parse(window.localStorage.getItem(Name));
    var result = '<table class="table table-dark table-hover">';
    if (Object.keys(schema).length == 2) {
        var rows = schema[Object.keys(schema)[0]];
        var columns = schema[Object.keys(schema)[1]];
        var values=[];
        data.forEach(function(v){
            for (var i = 0; i < rows.length; i++) {
                for (var j = 0; j < columns.length; j++) {
                    if (v[Object.keys(schema)[0]] == rows[i] && v[Object.keys(schema)[1]] == columns[j]) { 
                        values.push(v);
                    }
                }
            }
        });

        result+='<thead><th></th>';
        for (var i = 0; i < columns.length; i++) {
            result+='<th>'+columns[i]+'</th>';
        }
        result+='</thead>';

        result+='<tbody>';
        for (var i = 0; i < values.length; i++) {
            for (var j = 0; j < rows.length; j++) {
                result+='<tr><td>'+rows[j]+'</td>';
                for (var k = 0; k < columns.length; k++) {
                    result+='<td data-row="'+rows[j]+'" data-column="'+columns[k]+'" data-time="'+values[i]["tarih"]+'" >' + values[i]["deger"]+'</td>';
                }
                result+='</tr>';
            }
        }
        result+='</tbody>';
    }
    else if(Object.keys(schema).length == 1){
        var columns = schema[Object.keys(schema)[0]];
        var key = Object.keys(schema)[0] =="Sistems"?"sistemId" : "sayacId";
        var values = [];
        for (var i = 0; i < columns.length; i++) {
            colId = (key=="sistemId" ? SistemsTable.find(function(v,index,a){return v.isim == columns[i]}) : SayacsTable.find(function(v,index,a){return v.isim == columns[i]})).id;
            values = data.filter(function(v,index,a){
                return v[key] == colId;
                /*if (v[key] == colId) {
                    values.push(v);
                }*/
            });
        }
        result+='<thead><th></th>';
        for (var i = 0; i < columns.length; i++) {
            result+='<th>'+columns[i]+'</th>';
        }
        result+='</thead>';

        result+='<tbody>';
        for (var i = 0; i < values.length; i++) {
            result+='<tr><td>'+((key == "sistemId" ) ? SayacsTable.find(function(v,index,a) { return values[i]["sayacId"] == v.id; }).isim : SistemsTable.find(function(v,index,a){ return values[i]["sistemId"] == v.id }).isim) +'</td>';
            for (var k = 0; k < columns.length; k++) {
                result+='<td data-row="'+((key == "sistemId" )?values[i]["sayacId"]:values[i]["sistemId"])+'" data-column="'+columns[k]+'" data-time="'+values[i]["tarih"]+'" >' + values[i]["deger"]+'</td>';
            }
            result+='</tr>';
        }
        result+='</tbody>';
    }
    result+='</table>';
    return result;
}

function getTr(data){
    result="";
    for (var i = 0; i < data.length; i++) {
        result+='<td>'+data[i]+'</td>';
    }
    return result;
}

function DropDownButton(ContentList,buttonContent){
    result='<div class="dropdown ">'
    result+=    '<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">'
    result+=buttonContent;
    result+=    '</button>'
    result+=    '<div class="dropdown-menu dropdown-menu-right" id="Dr">'
    result+=        '<input class="mx-2 filter-input" id="DrArama" type="text" placeholder="Ara.." />'
    if (Array.isArray(ContentList)) {
        result+= fillSearch(ContentList,false);
    }
    else{
        result+= fillSearch([ContentList],false);
    }
    result+=    '</div>'
    result+='</div>'
    return result;
}

function ShowingModal(heading, modelbody, cancelButtonTxt, okButtonTxt, callback) {
    $(".geciciModal").remove();
    var ContentListColumn=(Object.keys(tableschema).length == 2)?[Object.keys(tableschema)[1]]:[Object.keys(tableschema)[0]];
    var ContentListRow =  Object.keys(tableschema)[0];
    var confirmModal =
        $('<div class="modal hide fade geciciModal">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +

            '<h3>' + heading + '</h3>' +
            '<a class="close" data-dismiss="modal" >&times;</a>' +
            '</div>' +

            '<div class="modal-body">' +
            '<div class="float-left">' +
            modelbody +
            '</div>' +
            '<div class="float-left">' +
            DropDownButton(ContentListColumn,ContentListColumn[0]) +
            '</div>' +
            '<div class="float-left">' +
            DropDownButton(ContentListRow,ContentListRow[0]) +
            '</div>' +
            '</div>' +

            '<div class="modal-footer">' +
            '<a href="#" class="btn" data-dismiss="modal">' +
            cancelButtonTxt +
            '</a>' +
            '<a href="#" id="okButton" class="btn btn-primary">' +
            okButtonTxt +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');

    confirmModal.find('#okButton').click(function (event) {
        //CurrentPanel = "PersonalPanel"
        callback(CurrentPanel);
        confirmModal.modal('hide');
    });

    confirmModal.modal('show');
};