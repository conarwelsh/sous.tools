"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
/**
 * Sous Device Manager 2.0
 * Handles emulator lifecycle using adb.exe (WSL) or adb (Linux)
 */
var AVD_NAME = process.argv[2];
var IS_WSL = fs_1.default.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
var ADB = IS_WSL ? 'adb.exe' : 'adb';
var EMULATOR = IS_WSL ? 'emulator.exe' : 'emulator';
// Helper to get WSL IP
function getWslIp() {
    try {
        return (0, child_process_1.execSync)("ip route show default | awk '{print $3}'").toString().trim();
    }
    catch (e) {
        return '127.0.0.1';
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var WIN_IP, serial, emulatorCmd, userProfile, candidates, _i, candidates_1, candidate, attempts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!AVD_NAME) {
                        console.error('Usage: device-manager <avd_name>');
                        process.exit(1);
                    }
                    WIN_IP = getWslIp();
                    return [4 /*yield*/, findSerialByAvd(AVD_NAME)];
                case 1:
                    serial = _a.sent();
                    if (serial) {
                        console.error("\u2705 Device ".concat(AVD_NAME, " is already running (").concat(serial, ")."));
                        // Ensure ADB is connected to the right IP if WSL
                        if (IS_WSL) {
                            try {
                                (0, child_process_1.execSync)("".concat(ADB, " connect ").concat(WIN_IP, ":").concat(serial.split('-')[1]), { stdio: 'ignore' });
                            }
                            catch (e) { }
                        }
                        console.log(serial);
                        process.exit(0);
                    }
                    // 2. Start Emulator
                    console.error("\uD83D\uDE80 Launching emulator: ".concat(AVD_NAME, "..."));
                    if (IS_WSL) {
                        emulatorCmd = 'emulator.exe';
                        // Check if emulator is in PATH
                        try {
                            (0, child_process_1.execSync)('cmd.exe /c where emulator.exe', { stdio: 'ignore' });
                        }
                        catch (_b) {
                            userProfile = (0, child_process_1.execSync)('cmd.exe /c echo %USERPROFILE%').toString().trim();
                            candidates = [
                                "".concat(userProfile, "\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe"),
                                "C:\\Users\\".concat(process.env.USER, "\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe"),
                                "C:\\Android\\emulator\\emulator.exe"
                            ];
                            for (_i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                                candidate = candidates_1[_i];
                                try {
                                    // Check if file exists via cmd
                                    (0, child_process_1.execSync)("cmd.exe /c if exist \"".concat(candidate, "\" echo found"));
                                    emulatorCmd = "\"".concat(candidate, "\"");
                                    console.log("Found emulator at: ".concat(emulatorCmd));
                                    break;
                                }
                                catch (_c) { }
                            }
                        }
                        // Launch via cmd.exe to ensure it's a Windows process that survives WSL session
                        (0, child_process_1.spawn)('cmd.exe', ['/c', 'start', '/b', 'cmd', '/c', "".concat(emulatorCmd, " -avd ").concat(AVD_NAME, " -no-snapshot-load")], {
                            detached: true,
                            stdio: 'ignore'
                        }).unref();
                    }
                    else {
                        (0, child_process_1.spawn)(EMULATOR, ['-avd', AVD_NAME], { detached: true, stdio: 'ignore' }).unref();
                    }
                    // 3. Wait for boot and discover serial
                    console.error("\u23F3 Waiting for ".concat(AVD_NAME, " to register and finish booting (max 120s)..."));
                    attempts = 0;
                    _a.label = 2;
                case 2:
                    if (!(!serial && attempts < 60)) return [3 /*break*/, 5];
                    process.stderr.write('.');
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, findSerialByAvd(AVD_NAME)];
                case 4:
                    serial = _a.sent();
                    attempts++;
                    return [3 /*break*/, 2];
                case 5:
                    process.stderr.write('\n');
                    if (serial) {
                        console.error("\u2705 Device ".concat(serial, " is ready."));
                        console.log(serial);
                        process.exit(0);
                    }
                    else {
                        console.error("\u274C Failed to start emulator: ".concat(AVD_NAME));
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function findSerialByAvd(targetAvd) {
    return __awaiter(this, void 0, void 0, function () {
        var devicesOutput, lines, _i, lines_1, line, serial, avdName, model;
        return __generator(this, function (_a) {
            try {
                devicesOutput = (0, child_process_1.execSync)("".concat(ADB, " devices"), { timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
                lines = devicesOutput.split('\n').filter(function (l) { return l.includes('\tdevice'); });
                for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                    line = lines_1[_i];
                    serial = line.split('\t')[0].trim();
                    try {
                        avdName = (0, child_process_1.execSync)("".concat(ADB, " -s ").concat(serial, " shell getprop ro.boot.qemu.avd_name"), { timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
                        if (avdName === targetAvd)
                            return [2 /*return*/, serial];
                        model = (0, child_process_1.execSync)("".concat(ADB, " -s ").concat(serial, " shell getprop ro.product.model"), { timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
                        if (model.toLowerCase().includes(targetAvd.toLowerCase().replace(/_/g, ' ')))
                            return [2 /*return*/, serial];
                    }
                    catch (e) {
                        // Device might be offline or booting
                    }
                }
            }
            catch (e) {
                // adb might not be in path yet
            }
            return [2 /*return*/, null];
        });
    });
}
main().catch(function (err) {
    console.error(err);
    process.exit(1);
});
