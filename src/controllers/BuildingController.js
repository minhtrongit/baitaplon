const building = require('../models/building');
const district = require('../models/district');
const renttype = require('../models/renttype');
const customer = require('../models/customer');
const comment = require('../models/comment');

class BuildingController {
    // [GET] /building  
    index(req, res) {
        var nameInput = new RegExp(req.query.name, 'i');
        building.find({ name: nameInput }, function (err, buildings) {
            if (err) throw err
            district.find(function (err, distrcits) {
                renttype.find(function (err, rentypes) {
                    var results = [];
                    var dis;
                    buildings.forEach(item => {
                        var rents = [];
                        distrcits.forEach(item2 => {
                            if (item2._id == item.districtid)
                                dis = item2.name;
                        })
                        item.renttypeids.forEach(item4 => {
                            rentypes.forEach(item3 => {
                                if (item3._id == item4) {
                                    rents.push(item3.name)
                                }
                            })
                        })
                        var dataBuilding = toBuildingRespone(item, dis, rents);
                        results.push(dataBuilding)
                    });
                    res.render('building/index', { listBuilding: results, namesearch: req.query.name });
                })
            })
        })//
    }
    // [GET] /building/customer  
    detailview(req, res) {
        building.find({ _id: req.query.id }, function (err, buildings) {
            if (err) throw err
            district.find(function (err, distrcits) {
                renttype.find(function (err, rentypes) {
                    customer.find(function (err, customers) {
                        var results = [];
                        var dis;
                        var cuss = [];
                        buildings.forEach(item => {
                            var rents = [];
                            cuss = [];
                            distrcits.forEach(item2 => {
                                if (item2._id == item.districtid)
                                    dis = item2.name;
                            })
                            item.renttypeids.forEach(item4 => {
                                rentypes.forEach(item3 => {
                                    if (item3._id == item4) {
                                        rents.push(item3.name)
                                    }
                                })
                            })
                            customers.forEach(item5 => {
                                item.customerids.forEach(item6 => {
                                    if (item5._id.toString() == item6) {
                                        cuss.push(item5)
                                    }
                                })
                            })
                            var dataBuilding = toBuildingRespone(item, dis, rents);
                            results.push(dataBuilding)
                        });
                        res.render('building/detail', { listBuilding: results, listCustomer: cuss });
                    })
                })
            })
        })//
    }
    //=====================================================================================================================
    //[POST] /buidling/:idBuilding/customer
    insertCustomer(req, res) {
        var idBuilding = req.params.id;
        var dataInput = req.body;
        var dataCustomer = {
            "name": dataInput.name,
            "phone": dataInput.phone,
            "email": dataInput.email,
            "type": dataInput.type,
            "status": "pending"
        }


        building.findById(idBuilding, function (err, dataBuid) {
            if (err)
                res.send(err)
            else {
                var listIDcustomer = dataBuid.customerids;
                customer.create(dataCustomer, function (err, dataCus) {
                    if (err)
                        res.send(err);
                    else {
                        listIDcustomer.push(dataCus._id.toString());
                        building.findByIdAndUpdate(idBuilding, { customerids: listIDcustomer }, function (err, result) {
                            if (err)
                                res.send(err)
                            else

                                res.json("oke");


                        })
                    }

                })
            }
        })




    }
    //=====================================================================================================================
    //[PUT] /building/customer/:id/update
    updateCustomer(req, res) {
        var idCus = req.params.id;
        var statusBody = req.body.status;
        customer.findByIdAndUpdate(idCus, { status: statusBody }, function (err, data) {
            if (err)
                res.send(err);
            else {
                res.json("ok");
            }
        })


    }

    //=====================================================================================================================
    // [GET] /building/:id/customer  
    getCusByBuildingID(req, res) {
        building.findById(req.params.id, function (err, data) {
            customer.find(function (err, data2) {
                var cuss = [];
                data2.forEach(item => {
                    data.customerids.forEach(item2 => {
                        if (item._id.toString() == item2)
                            cuss.push(item);
                    })
                })
                res.json(cuss)
            })
        })
    }
    //[GET] buidling/insert  
    insertView(req, res) {
        district.find(function (err, district) {
            renttype.find(function (err, rentypes) {
                var data = {
                    "district": district,
                    "renttype": rentypes
                }
                res.render('building/addBuilding', { data: data })
            })
        })

    }
    //[GET] /search
    searchName(req, res) {
        var nameBuilding = req.query.nameBuilding.toString();
        building.find({ name: nameBuilding }, function (err, data) {
            res.render('buidling/searchBuilding', { list: data });
        });
    }
    //[GET] building/:id/update  
    updateView(req, res) {
        var id = req.params.id;

        //   var dataBuilding,dataDictrict
        building.findOne({ _id: id }, function (err, dataBuilding) {
            if (err)
                res.send(err);
            else {
                district.find(function (err, dataDictrict) {
                    renttype.find(function (err, dataRenttype) {
                        var listRentTypes = [];
                        dataRenttype.forEach(item => {
                            var flag = 0;
                            dataBuilding.renttypeids.forEach(item2 => {
                                if (item._id == item2) {
                                    flag++;
                                }
                            })
                            if (flag > 0) {
                                listRentTypes.push({
                                    "_id": item._id,
                                    "name": item.name,
                                    "checked": "checked"
                                })
                            } else {
                                listRentTypes.push({
                                    "_id": item._id,
                                    "name": item.name,
                                    "checked": ""
                                })
                            }
                        })
                        var listDistricts = [];
                        dataDictrict.forEach(item => {
                            if (item._id == dataBuilding.districtid) {
                                listDistricts.push({
                                    "_id": item._id,
                                    "name": item.name,
                                    "selected": "selected"
                                })
                            } else {
                                listDistricts.push({
                                    "_id": item._id,
                                    "name": item.name,
                                    "selected": ""
                                })
                            }

                        })
                        var Data = {
                            building: dataBuilding,
                            district: listDistricts,
                            renttype: listRentTypes
                        }
                        res.render('Building/editBuilding', { data: Data });
                    })

                })
            }
        })


    }
    //[GET] /search/:nameBuilding
    searchName(req, res) {
        var nameBuilding = req.query.nameBuilding.toString();
        building.find({ name: nameBuilding }, function (err, data) {
            res.render('/buidling/searchBuilding', { list: data });
        });
    }
    //[POST] /building/insert
    insertModel(req, res) {
        var dataInsert = req.body;
        var dataBuilding = toBuildingRequest(dataInsert);
        building.create(dataBuilding, function (err, result) {
            if (err)
                res.send("INSERT FAILURE");
            else {
                res.json({
                    "status": "success"
                });
            }
        });
    }
    //[PUT] /building/:id/update
    updateModel(req, res) {
        var id = req.params.id.trim();
        var dataUpdate = req.body;
        var dataBuilding = toBuildingRequest(dataUpdate);
        building.updateOne({ _id: id }, dataBuilding, function (err, data) {
            if (err){
                throw err;
            }
                
            else
                res.json("ok");
        })
    }




    //[DELETE] /building/:id/delete
    deleteModel(req, res) {
        var id = req.params.id;
        building.deleteOne({ _id: id }, function (err, data) {
            if (err)
                res.send(err);
            else {
                res.status(200).json("oke");
            }
        })

    }

    // [POST] /building/:id/comment
    insertComment(req, res) {
        var id = req.params.id;
        building.findById(id, function (err, data) {
            comment.create(toCommentReq(req.body), function (err, rel) {
                if (err) throw err
                var idcmts = data.commentids;
                idcmts.push(rel._id.toString())
                building.findByIdAndUpdate(id, { commentids: idcmts }, function (err, rel2) {

                    building.findById(id, function (err, data) {
                        comment.find(function (err, data2) {
                            var listCmt = [];
                            data.commentids.forEach(item => {
                                data2.forEach(item2 => {
                                    if (item == item2._id.toString())
                                        listCmt.push(item2)
                                })
                            })
                            var count = 0;
                            var rateall = 0;
                            listCmt.forEach(item3 => {
                                rateall += parseInt(item3.rate);
                                count++;
                            })
                            var rank = rateall / count;
                            building.findByIdAndUpdate(id, { rank: rank }, function (err, kq) {
                                res.json(rel2);
                            })
                        })
                    })


                })
            })
        })
    }

    // [GET] /building/:id/comment
    getCmt(req, res) {
        var id = req.params.id;
        building.findById(id, function (err, data) {
            comment.find(function (err, data2) {
                var listCmt = [];
                data.commentids.forEach(item => {
                    data2.forEach(item2 => {
                        if (item == item2._id.toString())
                            listCmt.push(item2)
                    })
                })
                var sum = listCmt.length;
                var s5 = 0;
                var s4 = 0;
                var s3 = 0;
                var s2 = 0;
                var s1 = 0;
                listCmt.forEach(item2 => {
                    if (item2.rate == 5)
                        s5++;
                    if (item2.rate == 4)
                        s4++;
                    if (item2.rate == 3)
                        s3++;
                    if (item2.rate == 2)
                        s2++;
                    if (item2.rate == 1)
                        s1++;
                })
                s5 = (s5 / sum) * 100;
                s4 = (s4 / sum) * 100;
                s3 = (s3 / sum) * 100;
                s2 = (s2 / sum) * 100;
                s1 = (s1 / sum) * 100;
                var datares = {
                    "listCmt": listCmt,
                    "s1": s1,
                    "s2": s2,
                    "s3": s3,
                    "s4": s4,
                    "s5": s5,
                    "sum": sum
                }
                res.json(datares);
            })
        })
    }
    // [PUT] /building/comment/:id
    putRep(req, res) {
        var id = req.params.id;
        comment.findByIdAndUpdate(id, { reply: req.body.reply }, function (err, data) {
            if (err) throw err;
            res.json(data);
        })
    }
}
function toBuildingRespone(item, dis, rents) {
    var result = {
        "_id": item._id,
        "name": item.name,
        "rentarea": item.rentarea,
        "imagelink": item.imagelink,
        "address": item.street + "-" + item.ward + "-" + dis,
        "renttypes": rents,
        "note": item.note,
        "managername": item.managername,
        "managerphone": item.managerphone,
        "rentprice": item.rentprice,
        "sellprice": item.sellprice,
        "customerids": item.customerids,
        "rank": item.rank,
        "commentids": item.commentids,
        "avalible":item.avalible
    }
    return result;
}
function toBuildingRequest(data) {
    var result = {
        "name": data.name,
        "rentarea": data.rentarea,
        "imagelink": data.imagelink,
        "street": data.street,
        "districtid": data.districtid,
        "ward": data.ward,
        "renttypeids": data.rentypes,
        "note": data.note,
        "managername": data.managername,
        "managerphone": data.managerphone,
        "rentprice": data.rentprice,
        "sellprice": data.sellprice,
        "avalible":data.avalible
    }
    return result;
}
function toCommentReq(data) {
    var result = {
        "name": data.name,
        "content": data.content,
        "rate": data.rate,
        "reply": ""
    }
    return result;
}

module.exports = new BuildingController;