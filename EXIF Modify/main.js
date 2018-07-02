// By JunM。
// Please refer to Readme.md

// let app = require("scripts/app");
let piexif = require("scripts/piexif");
let utils = require("scripts/utils");
let exifObj = null; // Store exif data of original photo.
let image_data = null;
let image_data_base64 = null;
let photo_date = null;

let deviceScreenHeight = $device.info["screen"]["height"];
let deviceScreenWidth = $device.info["screen"]["width"];

let input_element_height = deviceScreenHeight / 15 - 10;


function input_element_top(index) {
    return 10 + (5 + input_element_height) * (index - 1)

}

$app.keyboardToolbarEnabled = true;

let latitude_choices = [
    {
        name: $l10n("N"),
        value: "N"
    },
    {
        name: $l10n("S"),
        value: "S"
    }
];

let longtitude_choices = [
    {
        name: $l10n("E"),
        value: "E"
    },
    {
        name: $l10n("W"),
        value: "W"
    }
];


function gps_decimal_to_sexagecimal(gps_decimal) {

    let gps_degree = parseInt(gps_decimal.toString());
    let gps_minute = parseInt(((gps_decimal - gps_degree) * 60).toString());
    let gps_second_100 = parseInt((((gps_decimal - gps_degree) * 60 * 60 - gps_minute * 60) * 100).toString());

    return [gps_degree, gps_minute, gps_second_100]
}


function gps_sexagecimal_to_decimal(gps_degree, gps_minute, gps_second_100) {
    return (gps_degree + (gps_minute / 60) + (gps_second_100 / 360000)).toFixed(4)
}

function show_tips() {
    return new Promise(function (resolve, reject) {
        user_data = $cache.get("user_data");
        if (user_data === undefined) {


            $ui.alert({
                title: $l10n("Tips"),
                message: $l10n("This script uses piexifjs library to modify exif of photos and does not support HEIF."),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: function () {
                            $cache.set("user_data", {});
                            resolve("Whatever");
                        }
                    },
                    {
                        title: $l10n("Exit"),
                        handler: function () {
                            utils.stopScript();
                        }
                    }
                ]
            });


        } else {
            resolve("Whatever");
        }
    });
}


function store_original_exif(original_photo_data) {

    return new Promise(function (resolve, reject) {

        image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(original_photo_data);
        console.log("image_data_base64:");
        console.log(image_data_base64);

        exifObj = piexif.load(image_data_base64);
        console.log("exifObj:");
        console.log(exifObj);
        // $ui.alert("adsfsad");
        console.log($l10n("Device Maker:"));
        console.log(exifObj["0th"]["271"]);

        console.log($l10n("Device Model:"));
        console.log(exifObj["0th"]["272"]);

        console.log($l10n("Lens Details:"));
        console.log(exifObj["Exif"]["42036"]);

        console.log($l10n("Create Time:"));
        console.log(exifObj["0th"]["306"]);

        console.log($l10n("Create Time:"));
        console.log(exifObj["0th"]["306"]);

        console.log($l10n("Latitude:"));
        console.log($l10n(exifObj["GPS"]["1"]));
        console.log(exifObj["GPS"]["2"]["0"]["0"] + "°" + exifObj["GPS"]["2"]["1"]["0"] + "\'" + exifObj["GPS"]["2"]["2"]["0"] + "\"");
        console.log($l10n("Longitude:"));

        console.log(exifObj["GPS"]["4"]["0"]["0"] + "°" + exifObj["GPS"]["4"]["1"]["0"] + "\'" + exifObj["GPS"]["4"]["2"]["0"] + "\"");
        resolve("Whatever");
    });
}


function generate_new_photo_with_original_exif(compressed_photo_data_without_exif) {
    exifObj_original["0th"][piexif.ImageIFD.Orientation] = 0;
    let exifbytes = piexif.dump(exifObj_original);
    image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(compressed_photo_data_without_exif);
    let new_photo_base64 = piexif.insert(exifbytes, image_data_base64);
    return $data({
        url: new_photo_base64
    })
}


const exifModifyView = {
    props: {
        title: $l10n("EXIF Modify"),
    },
    views: [

        // Device Maker
        {
            type: "label",
            props: {
                text: $l10n("Device Maker:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(1));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "device_maker_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(1));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["0th"]["271"] = $("device_maker_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["0th"]["271"]);
                    sender.blur();
                }
            }

        },

        // Device Model
        {
            type: "label",
            props: {
                text: $l10n("Device Model:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(2));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "device_model_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(2));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["0th"]["272"] = $("device_model_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["0th"]["272"]);
                    sender.blur();
                }
            }
        },

        // Lens Model
        {
            type: "label",
            props: {
                text: $l10n("Lens Model:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(3));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "lens_model_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(3));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["Exif"]["42036"] = $("lens_model_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["Exif"]["42036"]);
                    sender.blur();
                }
            }

        },

        // Resolution
        {
            type: "label",
            props: {
                text: $l10n("Resolution:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.3);
            }
        },
        {
            type: "label",
            props: {
                id: "resolution_label",
                text: "0 * 0",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth / 2);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            }
        },

        // Time
        {
            type: "label",
            props: {
                text: $l10n("Create Time:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.3);
            }
        },
        {
            type: "button",
            props: {
                id: "modify_time_button",
                title: "",
            },
            layout: function (make) {

                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.5);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.48);

            },
            events: {
                tapped: function (sender) {
                    $ui.push(timeModifyView);
                    $("photo_date_picker").date = photo_date;

                }
            }
        },




        // map
        {
            type: "map",
            props: {
                id: "photo_gps_view",
                location: {
                    lat: 31.2990,
                    lng: 120.5853
                }
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(6));
                make.left.equalTo(0);
                make.height.equalTo(deviceScreenHeight * 0.4);
                make.width.equalTo(deviceScreenWidth * 1);

            }
        },
        {
            type: "button",
            props: {
                id: "modify_gps_button",
                title: $l10n("Tap & Modify"),
            },
            layout: function (make) {

                make.top.equalTo(input_element_top(6));
                make.left.equalTo(deviceScreenWidth * 0.01);
                make.height.equalTo(deviceScreenHeight * 0.05);
                make.width.equalTo(deviceScreenWidth * 0.30);

            },
            events: {
                tapped: function (sender) {
                    $location.select({
                        handler: function (result) {
                            let lat = result.lat;
                            let lng = result.lng;
                            lat = gps_decimal_to_sexagecimal(lat);
                            lng = gps_decimal_to_sexagecimal(lng);

                            exifObj["GPS"]["2"]["0"]["0"] = lat[0];
                            exifObj["GPS"]["2"]["1"]["0"] = lat[1];
                            exifObj["GPS"]["2"]["2"]["0"] = lat[2];

                            exifObj["GPS"]["4"]["0"]["0"] = lng[0];
                            exifObj["GPS"]["4"]["1"]["0"] = lng[1];
                            exifObj["GPS"]["4"]["2"]["0"] = lng[2];

                            $("photo_gps_view").location = {
                                lat: gps_sexagecimal_to_decimal(
                                    exifObj["GPS"]["2"]["0"]["0"],
                                    exifObj["GPS"]["2"]["1"]["0"],
                                    exifObj["GPS"]["2"]["2"]["0"]
                                ),
                                lng: gps_sexagecimal_to_decimal(
                                    exifObj["GPS"]["4"]["0"]["0"],
                                    exifObj["GPS"]["4"]["1"]["0"],
                                    exifObj["GPS"]["4"]["2"]["0"]
                                )
                            };


                        }
                    })
                }
            }
        },


        // Finish
        {
            type: "button",
            props: {
                id: "finish_button",
                title: $l10n("Save & Exit"),
            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.75);
                // make.left.equalTo(deviceScreenWidth * 0.23);
                make.centerX.equalTo(0).offset(9);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.618 / 2);
            },
            events: {
                tapped: function (sender) {
                    let exifbytes = piexif.dump(exifObj);
                    image_data_base64 = piexif.insert(exifbytes, image_data_base64);
                    $photo.save({
                        data: $data({
                            url: image_data_base64
                        }),
                        handler: function (result) {
                            if (result === true) {
                                $ui.toast($l10n("Saved successfully."), 1);
                                utils.tapticTaptic(9);
                                $delay(1.5, function () {
                                    utils.stopScript();
                                });
                            } else {
                                $ui.alert({
                                    title: "Error",
                                    message: result
                                });
                                utils.stopScript();
                            }
                        }
                    })

                }
            }
        },


    ]
};


const timeModifyView = {
    props: {
        title: $l10n("EXIF Modify"),
    },
    views: [
        {
            type: "date-picker",
            props: {
                id: "photo_date_picker",
                interval: 1,
                date: new Date(),
            },
            layout: function (make) {
                make.top.equalTo(20);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.7);
                make.width.equalTo(deviceScreenWidth * 0.86);
            },
            events: {
                changed: function (sender) {
                    // taskStartTime = formatTimeForOmniFocus(sender.date);


                    exifObj["Exif"]["36867"] = sender.date.getFullYear()
                        + ":"
                        + ("00" + (sender.date.getMonth() + 1)).slice(-2)
                        + ":"
                        + ("00" + sender.date.getDate()).slice(-2)
                        + " "
                        + ("00" + sender.date.getHours()).slice(-2)
                        + ":"
                        + ("00" + sender.date.getMinutes()).slice(-2)
                        + ":"
                        + exifObj["0th"]["306"].slice(17, 19);

                    $("modify_time_button").title = exifObj["Exif"]["36867"].slice(0, 4)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(5, 7)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(8, 10)
                        + " "
                        + exifObj["Exif"]["36867"].slice(11, 13)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(14, 16)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(17, 19);


                }
            }
        },
        {
            type: "button",
            props: {
                id: "save_time_button",
                title: $l10n("Save & Return"),
            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.75);
                // make.left.equalTo(deviceScreenWidth * 0.23);
                make.centerX.equalTo(0).offset(9);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.45);
            },
            events: {
                tapped: function (sender) {
                    $ui.pop();
                }
            }
        }
    ]
};


// TODO
if (($app.env !== $env.app)) {
    $ui.alert({
        title: $l10n("Please run in JSBox APP"),
        actions: [
            {
                title: "Jump to JSBox APP",
                handler: function () {
                    $app.openURL("jsbox://");
                }
            },
            {
                title: "Exit",
                handler: function () {
                    utils.stopScript();
                }
            }
        ]
    })

} else if ($app.env === $env.app) {
    show_tips().then(function () {
        $photo.pick({
            multi: false,
            format: "data",
            handler: function (resp) {
                image_data = resp.data;

                store_original_exif(image_data).then(function () {
                    let photo_date_string = exifObj["Exif"]["36867"];
                    photo_date = new Date(
                        photo_date_string.slice(0, 4),
                        photo_date_string.slice(5, 7) - 1,
                        photo_date_string.slice(8, 10),
                        photo_date_string.slice(11, 13),
                        photo_date_string.slice(14, 16),
                        photo_date_string.slice(17, 19),
                    );
                    console.log(exifObj["0th"]["271"]);
                    $ui.render(exifModifyView);
                    $("device_maker_input").text = exifObj["0th"]["271"];
                    $("device_model_input").text = exifObj["0th"]["272"];
                    $("lens_model_input").text = exifObj["Exif"]["42036"];
                    $("resolution_label").text = exifObj["Exif"]["40963"] + " * " + exifObj["Exif"]["40962"];


                    $("modify_time_button").title = photo_date_string.slice(0, 4)
                        + "-"
                        + photo_date_string.slice(5, 7)
                        + "-"
                        + photo_date_string.slice(8, 10)
                        + " "
                        + photo_date_string.slice(11, 13)
                        + ":"
                        + photo_date_string.slice(14, 16)
                        + ":"
                        + photo_date_string.slice(17, 19);

                    $("photo_gps_view").location = {
                        lat: gps_sexagecimal_to_decimal(
                            exifObj["GPS"]["2"]["0"]["0"],
                            exifObj["GPS"]["2"]["1"]["0"],
                            exifObj["GPS"]["2"]["2"]["0"]
                        ),
                        lng: gps_sexagecimal_to_decimal(
                            exifObj["GPS"]["4"]["0"]["0"],
                            exifObj["GPS"]["4"]["1"]["0"],
                            exifObj["GPS"]["4"]["2"]["0"]
                        )
                    };

                    console.log(gps_sexagecimal_to_decimal(
                        exifObj["GPS"]["2"]["0"]["0"],
                        exifObj["GPS"]["2"]["1"]["0"],
                        exifObj["GPS"]["2"]["2"]["0"]
                    ));



                })
            }
        })

    })

}










