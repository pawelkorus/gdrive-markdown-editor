import {expect, test, beforeAll} from "@jest/globals"
import {default as googleDriveExt} from "../../src/markdown/googleDriveExt"
import { default as showdown } from "showdown"

beforeAll(function() {
    showdown.extension("testExt", googleDriveExt)
})

test("should transform to gdrive with only src", function () {
    const conv = prepareConverter();
    const res = conv.makeHtml("test111 '''gd http://test.image.com/image1 test222")

    expect(res).toEqual('<p>test111 <gdrive src=\"http://test.image.com/image1\"></gdrive> test222</p>');
});

test("should transform to gdrive with src and alt", function() {
    const conv = prepareConverter()
    const res = conv.makeHtml("test '''gd[alttext] http://test.image.com/image1 test")

    expect(res).toEqual("<p>test <gdrive src=\"http://test.image.com/image1\" alt=\"alttext\"></gdrive> test</p>");
});

function prepareConverter() {
    const conv = new showdown.Converter()
    conv.useExtension("testExt")
    return conv;
}
