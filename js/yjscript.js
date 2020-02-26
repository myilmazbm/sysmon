
$(document).ready(function () {
    //alert("Yüklendi");
    //"http://localhost:59528/api/sunucu"
    callTable("http:/sysmon.fintek.local:5000/api", "sayacs", "icerik");
    
    
});
function filterinput() {
    $("input.filter-input").keyup(function () {
        var value = $(this).val().toLowerCase();
        $(this).parent().find("tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
}
filterinput();

function callTable(url, table, containerid) {
    var xTable = new ApiTable(table, url + "/" + table, url + "/" + table, url + "/" + table, url + "/" + table);
    RefreshTable(xTable, function () {
        var table = CreateCRUDTable(xTable);
        $("#"+containerid).html(table);
    });
}

function ApiTable(Name, Create, Read, Delete, Update) {
    this.Name = Name;
    this.Create = Create;
    this.Read = Read;
    this.Delete = Delete;
    this.Update = Update;
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

function AddRow() {
    if (arguments.length < 1) {
        return 0;
    }
    var XTable = arguments[0];

    var jsonitem = '{';
    for (var i = 1; i < (arguments.length); i++) {
        if (arguments[i] == "ID" || arguments[i] == "Id" || arguments[i] == "id") {
            continue;
        }
        jsonitem += '"' + arguments[i] + '"' + ':' + '"' + $('#C' + XTable.Name + '-' + arguments[i]).val() + '"';

        if (i != (arguments.length - 1)) {
            jsonitem += ',';
        }
    }
    jsonitem += '}';
    $.ajax({
        type: 'POST',
        url: XTable.Create,
        data: jsonitem,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            var table = "";
            table = '<tr id="S' + XTable.Name + '-' + data[Object.keys(data)[0]] + '">' + RenewRow(XTable, data[Object.keys(data)[0]], data) + '</tr>';
            $('#C' + XTable.Name + 'ID').parent().before(table);
        },
        failure: function (data) {
            alert('Oluşturma Başarısız: ' + data.responseText);
        }, //End of AJAX failure function  
        error: function (data) {
            alert('Oluşturma Hatası: ' + data.responseText);
        } //End of AJAX error function  
    });
}
function EditRowX() {
    if (arguments.length < 1) {
        return 0;
    }
    var XTable = arguments[0];
    var ID = arguments[1];
    var jsonitem = '{';
    for (var i = 2; i < (arguments.length); i++) {
        if (arguments[i] == 'ID' || arguments[i] == "Id" || arguments[i] == "id") {
            jsonitem += '"' + arguments[i] + '"' + ':' + ID + ',';
            continue;
        }
        jsonitem += '"' + arguments[i] + '"' + ':' + '"' + $('#U' + XTable.Name + '-' + arguments[i]).val() + '"';
        //alert('#U' + XTable.Name + '-' + arguments[i]);
        if (i != (arguments.length - 1)) {
            jsonitem += ',';
        }
    }
    jsonitem += '}';
    $.ajax({
        type: 'PUT',
        url: XTable.Update + '/' + ID,
        data: jsonitem,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            RenewRowX(XTable, ID, JSON.parse(jsonitem));
        },
        failure: function (data) {
            alert('Güncelleme Başarısız: ' + data.responseText);
        }, //End of AJAX failure function  
        error: function (data) {
            alert('Güncelleme Hatası: ' + data.responseText);
        } //End of AJAX error function  
    });
}
function EditRow(XTable, ID, element) {
    var rowtable = "";
    var heads = GetHeaders(element);
    for (key in element) {
        if (key == "ID" || key == "Id" || key == "id") {
            rowtable += '<td>' + element[key] + '</td>';
            continue;
        }
        rowtable += '<td><input class="form-control" id="U' + XTable.Name + '-' + key + '" type="text" placeholder="' + key + '..." name="' + key + '" value="' + element[key] + '"></td>';
    }
    rowtable += "<td><button class='btn btn-default' onclick='" + 'EditRowX(' + JSON.stringify(XTable) + ',' + ID + ',"' + heads.join('","') + '"' + ");'" + '><span class="fa fa-edit text-primary" style="font-size:xx-large;"></span></button></td>';
    rowtable += "<td><button class='btn btn-default' onclick='" + 'RenewRowX(' + JSON.stringify(XTable) + ',' + ID + ',' + JSON.stringify(element) + ");'" + '><span class="fa fa-sync text-info" style="font-size:xx-large;"></span></button></td>';
    $("#S" + XTable.Name + '-' + ID).html(rowtable);
}

function RenewRowX(XTable, ID, element) {
    $("#S" + XTable.Name + '-' + ID).html(RenewRow(XTable, ID, element));
}

function RenewRow(XTable, ID, element) {
    var table = '';
    for (key in element) {
        if (key == "ID" || key == "Id" || key == "id") {
            table += '<td>' + element[key] + '</td>';
            continue;
        }
        table += '<td>' + element[key] + '</td>';
    }
    table += '<td><button class="btn btn-default" onclick=' + "'EditRow(" + JSON.stringify(XTable) + "," + element[Object.keys(element)[0]] + "," + JSON.stringify(element) + ");'" + '><span class="fa fa-edit text-primary" style="font-size:xx-large;"></span></button></td>\
         <td><button class="btn btn-default" onclick=' + "'DeleteRow(" + JSON.stringify(XTable) + "," + element[Object.keys(element)[0]] + ");'" + '><span class="fa fa-trash-alt text-danger" style="font-size:xx-large;"></span></button></td>';
    return table;
}

function DeleteRow(XTable, ID) {
    var DeleteRowX = function () {
        $.ajax({
            type: 'DELETE',
            url: XTable.Delete + '/' + ID,
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            success: function (data) {
                $("#S" + XTable.Name + '-' + ID).remove();
                alert(ID + " IDli eleman " + "Silinmiştir.");
            },
            failure: function (data) {
                alert("Silme Başarısız: " + data.responseText);
            }, //End of AJAX failure function  
            error: function (data) {
                alert("Silme Hatası: " + data.responseText);
            } //End of AJAX error function  
        });
    }

    confirmQuestion(XTable.Name + ' Silme', ID + ' id li elemanı silmek istediğinize emin misiniz?', 'İptal', 'Sil', DeleteRowX);
}
function confirmQuestion(heading, question, cancelButtonTxt, okButtonTxt, callback) {
    $(".geciciModal").remove();
    var confirmModal =
        $('<div class="modal hide fade geciciModal">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +

            '<h3>' + heading + '</h3>' +
            '<a class="close" data-dismiss="modal" >&times;</a>' +
            '</div>' +

            '<div class="modal-body">' +
            '<p>' + question + '</p>' +
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
        callback();
        confirmModal.modal('hide');
    });

    confirmModal.modal('show');
};
function CreateCRUDTable(XTable) {
    if (XTable.Name == "") {
        return;
    }//
    var tableData = JSON.parse(window.localStorage.getItem(XTable.Name));
    var heads = String(GetHeaders(tableData[0])).split(',');
    var table = '\
    <h2 class="text-capitalize">' + XTable.Name + '</h2>\
    <p> '+ XTable.Name + ' Tablosunda arama yapabilir ve düzenleyebilirsiniz. </p>\
    <input class="form-control filter-input" onfocus="filterinput();" type="text" placeholder="Search..">\
    <br>\
    <table class="table table-bordered table-striped" id="Table-'+ XTable.Name + '">\
    <thead>\
    <tr>';

    for (item in heads) {
        table += '<th>' + heads[item] + '</th>';
    }
    table += '<th> Düzenle </th><th> Sil </th> ';
    table += '</tr>\
    </thead>\
    <tbody>';

    $.each(tableData, function (index, element) {
        table += '<tr id="S' + XTable.Name + '-' + element[Object.keys(element)[0]] + '">' + RenewRow(XTable, element[Object.keys(element)[0]], element) + '</tr>';
    });


    table += '<tr>';
    for (item in heads) {
        if (heads[item] == "ID" || heads[item] == "Id" || heads[item] == "id") {
            table += '<td id="C' + XTable.Name + 'ID" >ID</td>';
            continue;
        }
        table += '<td><input class="form-control" id="C' + XTable.Name + '-' + heads[item] + '" type="text" placeholder="' + heads[item] + '..." name="' + heads[item] + '" ></td>';
    }
    table += '<td><button class="btn btn-default" onclick=' + "'AddRow(" + JSON.stringify(XTable) + ',"' + heads.join('","') + '"' + ");'" + '><span class="fa fa-plus-circle text-success" style="font-size:xx-large;"></span></button></td>';
    table += '</tr>';

    table += '</tbody>';
    table += '</table>';
    return table;
}

function RefreshTable(XTable, callback) {
    if (XTable.Name == "") {
        return;
    }
    $.ajax({
        type: 'GET',
        url: XTable.Read,
        dataType: 'json',
        success: function (data) {
            //alert(JSON.stringify(data));
            window.localStorage.setItem(XTable.Name, JSON.stringify(data));
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