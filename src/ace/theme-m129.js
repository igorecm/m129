ace.define("ace/theme/m129",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-m129";
exports.cssText = `.ace-m129 .ace_gutter {
	background: #282828;
	color: #7f7f7f
}

.ace-m129 .ace_print-margin {
	width: 1px;
	background: #7f7f7f
}

.ace-m129 {
	background-color: #141414;
	color: #ffffff
}

.ace-m129 .ace_cursor {
	color: #ffffff
}

.ace-m129 .ace_marker-layer .ace_selection {
	background: #0000ff
}

.ace-m129.ace_multiselect .ace_selection.ace_start {
	box-shadow: 0 0 3px 0px #000000;
}

.ace-m129 .ace_marker-layer .ace_step {
	background: rgb(102, 82, 0)
}

.ace-m129 .ace_marker-layer .ace_bracket {
	margin: -1px 0 0 -1px;
	border: 1px solid #7f7f7f
}

.ace-m129 .ace_marker-layer .ace_active-line {
	background: #282828
}

.ace-m129 .ace_gutter-active-line {
	background-color: #3a3a3a
}

.ace-m129 .ace_marker-layer .ace_selected-word {
	border: 1px solid #2c2c2c
}

.ace-m129 .ace_invisible {
	color: #5b5b5b
}

.ace-m129 .ace_keyword,
.ace-m129 .ace_meta,
.ace-m129 .ace_storage,
.ace-m129 .ace_storage.ace_type,
.ace-m129 .ace_support.ace_type {
	color: #00ffff
}

.ace-m129 .ace_keyword.ace_operator {
	color: #ffffff
}

.ace-m129 .ace_constant.ace_character,
.ace-m129 .ace_constant.ace_language,
.ace-m129 .ace_constant.ace_numeric,
.ace-m129 .ace_keyword.ace_other.ace_unit,
.ace-m129 .ace_support.ace_constant,
.ace-m129 .ace_variable.ace_parameter {
	color: #ffff00
}

.ace-m129 .ace_constant.ace_other {
	color: #ffffff
}

.ace-m129 .ace_invalid {
	color: #ffffff;
	background-color: #ff0000
}

.ace-m129 .ace_invalid.ace_deprecated {
	color: #ffffff;
	background-color: #8d8d8d
}

.ace-m129 .ace_fold {
	background-color: #323232;
	border-color: #303030
}

.ace-m129 .ace_entity.ace_name.ace_function,
.ace-m129 .ace_support.ace_function,
.ace-m129 .ace_variable {
	color: #ff00ff
}

.ace-m129 .ace_support.ace_class,
.ace-m129 .ace_support.ace_type {
	color: #ffff00
}

.ace-m129 .ace_heading,
.ace-m129 .ace_markup.ace_heading,
.ace-m129 .ace_string {
	color: #ff0000
}

.ace-m129 .ace_entity.ace_name.ace_tag,
.ace-m129 .ace_entity.ace_other.ace_attribute-name,
.ace-m129 .ace_meta.ace_tag,
.ace-m129 .ace_string.ace_regexp,
.ace-m129 .ace_variable {
	color: #ffffff
}

.ace-m129 .ace_comment {
	color: #007f00
}

.ace-m129 .ace_indent-guide {
	background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHB3d/8PAAOIAdULw8qMAAAAAElFTkSuQmCC) right repeat-y
}`;

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass, false);
});                (function() {
                    ace.require(["ace/theme/m129"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            