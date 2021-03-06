const bcrypt = require('bcryptjs')

var routes = function(User) {
    var checkLogin = function(req, res) {
        var email = req.body.email;
        var password = req.body.password;

        User.find({email: email}, async function(err, response) {
            if (err) {
                console.log(err);
            } else {
                if (response.length != 0) {
                    console.log(response);
                    var storedPassword = response[0].password;
                    const isMatch = await bcrypt.compare(password, storedPassword)
                    if (isMatch) {
                        console.log("Successful login");
                        res.send("success");
                    } else {
                        console.log("error");
                        res.send("error");
                    }
                } else {
                    console.log("error");
                    res.send("error");
                }
            }
        })
    }

    var signup = async function(req, res) {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var password = await bcrypt.hash(req.body.password, 8);
        var favcity = req.body.favcity;

        var newUser = new User({
            email: email,
            password: password,
            firstName: firstname,
            lastName: lastname,
            favcity: favcity
        });

        User.find({email: email}, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                if (response.length != 0) {
                    res.send("user exists");
                } else {
                    newUser.save(function (err, response) {
                        if (err) {
                            console.log(err);
                            res.send("error");
                        } else {
                            console.log(response);
                            res.send("success");
                        }
                    });
                }
            }
        })
    }

    var deleteProfile = function(req, res) {
        var email = req.body.email;
        
        User.deleteOne({email: email}, function(err, response) {
            if (err) {
                console.log(err);
                res.send("error");
            } else {
                console.log('deleting ' + email);
                req.session.user = "";
                res.send("success");
            }
        })
    }

    var updateCity = function(req, res) {
        var email = req.body.email;
        var city = req.body.favcity;

        User.update({email: email}, {favcity: city}, function(err, response) {
            if (err) {
                console.log(err);
                res.send("error");
            } else {
                res.send("success");
            }
        })
    }

    var getFavCity = function(req, res) {
        var email = req.body.email;

        User.find({email: email}, function(err, response) {
            if (err) {
                console.log(err);
                res.send("error");
            } else {
                if (response.length == 0) {
                    res.send("error");
                } else {
                    var city = response[0].favcity;
                    res.send(city);
                }
            }
        })
    }

    return {
        check_login: checkLogin,
        signup: signup,
        delete_profile: deleteProfile,
        update_city: updateCity,
        get_fav_city: getFavCity
    }
}

module.exports = routes;