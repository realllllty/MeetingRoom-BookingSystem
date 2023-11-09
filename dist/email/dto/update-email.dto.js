"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_email_dto_1 = require("./create-email.dto");
class UpdateEmailDto extends (0, mapped_types_1.PartialType)(create_email_dto_1.CreateEmailDto) {
}
exports.UpdateEmailDto = UpdateEmailDto;
//# sourceMappingURL=update-email.dto.js.map