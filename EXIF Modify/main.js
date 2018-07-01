// By JunM。
// Please refer to Readme.md

// let app = require("scripts/app");
let piexif = require("scripts/piexif");
let utils = require("scripts/utils");
let exifObj = null; // Store exif data of original photo.
let image_data = null;
let image_data_base64 = null;

let deviceScreenHeight = $device.info["screen"]["height"];
let deviceScreenWidth = $device.info["screen"]["width"];

let input_element_height = deviceScreenHeight / 15 - 10;


function input_element_top(index) {
    return 10 + (5 + input_element_height) * (index - 1)

}

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

        // Latitude
        {
            type: "label",
            props: {
                text: $l10n("Lat:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 7);
            }
        },
        {
            type: "button",
            props: {
                id: "latitude_change_button",
                title: "",
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.23);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.14);
            },
            events: {
                tapped: function (sender) {
                    if (exifObj["GPS"]["1"] === "N") {
                        exifObj["GPS"]["1"] = "S";
                    } else {
                        exifObj["GPS"]["1"] = "N";
                    }
                    console.log(exifObj["GPS"]["1"]);
                    $("latitude_change_button").title = $l10n(exifObj["GPS"]["1"]);
                }
            }
        },
        {
            type: "input",
            props: {
                id: "latitude_degree_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.44);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.09);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["2"]["0"]["0"] = $("latitude_degree_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["2"]["0"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "\u00b0",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.54);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.03);
            }
        },
        {
            type: "input",
            props: {
                id: "latitude_minute_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.59);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.09);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["2"]["1"]["0"] = $("latitude_minute_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["2"]["1"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "\'",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.69);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.03);
            }
        },
        {
            type: "input",
            props: {
                id: "latitude_second_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.72);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.13);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["2"]["2"]["0"] = $("latitude_second_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["2"]["2"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "/100\"",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth * 0.86);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.13);
            }
        },


        // Longitude
        {
            type: "label",
            props: {
                text: $l10n("Lng:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 7);
            }
        },
        {
            type: "button",
            props: {
                id: "longitude_change_button",
                title: "",
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.23);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.14);
            },
            events: {
                tapped: function (sender) {
                    if (exifObj["GPS"]["3"] === "E") {
                        exifObj["GPS"]["3"] = "W";
                    } else {
                        exifObj["GPS"]["3"] = "W";
                    }
                    console.log(exifObj["GPS"]["3"]);
                    $("longitude_change_button").title = $l10n(exifObj["GPS"]["3"]);
                }
            }
        },
        {
            type: "input",
            props: {
                id: "longitude_degree_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.4);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.13);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["4"]["0"]["0"] = $("longitude_degree_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["4"]["0"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "\u00b0",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.54);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.03);
            }
        },
        {
            type: "input",
            props: {
                id: "longitude_minute_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.59);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.09);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["4"]["1"]["0"] = $("longitude_minute_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["4"]["1"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "\'",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.69);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.03);
            }
        },
        {
            type: "input",
            props: {
                id: "longitude_second_input",
                type: $kbType.nap,
                clearButtonMode: false,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.72);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.13);
            },
            events: {
                changed: function (sender) {
                    exifObj["GPS"]["4"]["2"]["0"] = $("longitude_second_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["GPS"]["4"]["2"]["0"]);
                    sender.blur();
                }
            }

        },
        {
            type: "label",
            props: {
                text: "/100\"",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.86);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.13);
            }
        },

        // Date Picker
        {
            type: "date-picker",
            props: {
                id: "photo_date_picker",
                interval: 1,
                date: new Date,
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(6) + deviceScreenHeight * 0.01);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.4);
                // make.width.equalTo(deviceScreenWidth * 0.03);
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
                make.top.equalTo(deviceScreenHeight * 0.7);
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
                    let photo_date = new Date(
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

                    $("latitude_change_button").title = $l10n(exifObj["GPS"]["1"]);
                    $("latitude_degree_input").text = exifObj["GPS"]["2"]["0"]["0"];
                    $("latitude_minute_input").text = exifObj["GPS"]["2"]["1"]["0"];
                    $("latitude_second_input").text = exifObj["GPS"]["2"]["2"]["0"];

                    $("longitude_change_button").title = $l10n(exifObj["GPS"]["3"]);
                    $("longitude_degree_input").text = exifObj["GPS"]["4"]["0"]["0"];
                    $("longitude_minute_input").text = exifObj["GPS"]["4"]["1"]["0"];
                    $("longitude_second_input").text = exifObj["GPS"]["4"]["2"]["0"];
                    $("photo_date_picker").date = photo_date;
                })
            }
        })

    })

}

