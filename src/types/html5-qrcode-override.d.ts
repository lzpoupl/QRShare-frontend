import "html5-qrcode";

declare module "html5-qrcode" {
  interface Html5Qrcode {
    /** 
     * 覆盖库中定义过窄的问题类型
     * 只修改 applyVideoConstraints 的类型，不影响其他方法
     */
    applyVideoConstraints(constraints: any): Promise<void>;
  }
}
