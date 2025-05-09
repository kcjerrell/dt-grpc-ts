// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';

import { ControlInputType } from './control-input-type.js';
import { ControlMode } from './control-mode.js';


export class Control implements flatbuffers.IUnpackableObject<ControlT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Control {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsControl(bb:flatbuffers.ByteBuffer, obj?:Control):Control {
  return (obj || new Control()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsControl(bb:flatbuffers.ByteBuffer, obj?:Control):Control {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Control()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

file():string|null
file(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
file(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

weight():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 1.0;
}

guidanceStart():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 0.0;
}

guidanceEnd():number {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 1.0;
}

noPrompt():boolean {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
}

globalAveragePooling():boolean {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : true;
}

downSamplingRate():number {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 1.0;
}

controlMode():ControlMode {
  const offset = this.bb!.__offset(this.bb_pos, 18);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : ControlMode.Balanced;
}

targetBlocks(index: number):string
targetBlocks(index: number,optionalEncoding:flatbuffers.Encoding):string|Uint8Array
targetBlocks(index: number,optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 20);
  return offset ? this.bb!.__string(this.bb!.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
}

targetBlocksLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 20);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

inputOverride():ControlInputType {
  const offset = this.bb!.__offset(this.bb_pos, 22);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : ControlInputType.Unspecified;
}

static startControl(builder:flatbuffers.Builder) {
  builder.startObject(10);
}

static addFile(builder:flatbuffers.Builder, fileOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, fileOffset, 0);
}

static addWeight(builder:flatbuffers.Builder, weight:number) {
  builder.addFieldFloat32(1, weight, 1.0);
}

static addGuidanceStart(builder:flatbuffers.Builder, guidanceStart:number) {
  builder.addFieldFloat32(2, guidanceStart, 0.0);
}

static addGuidanceEnd(builder:flatbuffers.Builder, guidanceEnd:number) {
  builder.addFieldFloat32(3, guidanceEnd, 1.0);
}

static addNoPrompt(builder:flatbuffers.Builder, noPrompt:boolean) {
  builder.addFieldInt8(4, +noPrompt, +false);
}

static addGlobalAveragePooling(builder:flatbuffers.Builder, globalAveragePooling:boolean) {
  builder.addFieldInt8(5, +globalAveragePooling, +true);
}

static addDownSamplingRate(builder:flatbuffers.Builder, downSamplingRate:number) {
  builder.addFieldFloat32(6, downSamplingRate, 1.0);
}

static addControlMode(builder:flatbuffers.Builder, controlMode:ControlMode) {
  builder.addFieldInt8(7, controlMode, ControlMode.Balanced);
}

static addTargetBlocks(builder:flatbuffers.Builder, targetBlocksOffset:flatbuffers.Offset) {
  builder.addFieldOffset(8, targetBlocksOffset, 0);
}

static createTargetBlocksVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startTargetBlocksVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addInputOverride(builder:flatbuffers.Builder, inputOverride:ControlInputType) {
  builder.addFieldInt8(9, inputOverride, ControlInputType.Unspecified);
}

static endControl(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createControl(builder:flatbuffers.Builder, fileOffset:flatbuffers.Offset, weight:number, guidanceStart:number, guidanceEnd:number, noPrompt:boolean, globalAveragePooling:boolean, downSamplingRate:number, controlMode:ControlMode, targetBlocksOffset:flatbuffers.Offset, inputOverride:ControlInputType):flatbuffers.Offset {
  Control.startControl(builder);
  Control.addFile(builder, fileOffset);
  Control.addWeight(builder, weight);
  Control.addGuidanceStart(builder, guidanceStart);
  Control.addGuidanceEnd(builder, guidanceEnd);
  Control.addNoPrompt(builder, noPrompt);
  Control.addGlobalAveragePooling(builder, globalAveragePooling);
  Control.addDownSamplingRate(builder, downSamplingRate);
  Control.addControlMode(builder, controlMode);
  Control.addTargetBlocks(builder, targetBlocksOffset);
  Control.addInputOverride(builder, inputOverride);
  return Control.endControl(builder);
}

unpack(): ControlT {
  return new ControlT(
    this.file(),
    this.weight(),
    this.guidanceStart(),
    this.guidanceEnd(),
    this.noPrompt(),
    this.globalAveragePooling(),
    this.downSamplingRate(),
    this.controlMode(),
    this.bb!.createScalarList<string>(this.targetBlocks.bind(this), this.targetBlocksLength()),
    this.inputOverride()
  );
}


unpackTo(_o: ControlT): void {
  _o.file = this.file();
  _o.weight = this.weight();
  _o.guidanceStart = this.guidanceStart();
  _o.guidanceEnd = this.guidanceEnd();
  _o.noPrompt = this.noPrompt();
  _o.globalAveragePooling = this.globalAveragePooling();
  _o.downSamplingRate = this.downSamplingRate();
  _o.controlMode = this.controlMode();
  _o.targetBlocks = this.bb!.createScalarList<string>(this.targetBlocks.bind(this), this.targetBlocksLength());
  _o.inputOverride = this.inputOverride();
}
}

export class ControlT implements flatbuffers.IGeneratedObject {
constructor(
  public file: string|Uint8Array|null = null,
  public weight: number = 1.0,
  public guidanceStart: number = 0.0,
  public guidanceEnd: number = 1.0,
  public noPrompt: boolean = false,
  public globalAveragePooling: boolean = true,
  public downSamplingRate: number = 1.0,
  public controlMode: ControlMode = ControlMode.Balanced,
  public targetBlocks: (string)[] = [],
  public inputOverride: ControlInputType = ControlInputType.Unspecified
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const file = (this.file !== null ? builder.createString(this.file!) : 0);
  const targetBlocks = Control.createTargetBlocksVector(builder, builder.createObjectOffsetList(this.targetBlocks));

  return Control.createControl(builder,
    file,
    this.weight,
    this.guidanceStart,
    this.guidanceEnd,
    this.noPrompt,
    this.globalAveragePooling,
    this.downSamplingRate,
    this.controlMode,
    targetBlocks,
    this.inputOverride
  );
}
}
