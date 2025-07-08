import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{w as s,e as t,u as W}from"./index-BavEqKhC.js";import{R as $}from"./index-D4lIrffr.js";import{c as ee}from"./cn-BaF2GUMg.js";const r=$.forwardRef(({className:a,variant:n="default",size:e="md",disabled:F=!1,loading:y=!1,children:J,...K},Q)=>{const U=["inline-flex items-center justify-center rounded-md font-medium transition-colors","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2","disabled:pointer-events-none disabled:opacity-50","relative overflow-hidden"],X={default:["bg-neutral-100 text-neutral-900 hover:bg-neutral-200","border border-neutral-200 hover:border-neutral-300"],primary:["bg-primary-500 text-white hover:bg-primary-600","shadow-sm hover:shadow-md"],secondary:["bg-secondary-500 text-white hover:bg-secondary-600","shadow-sm hover:shadow-md"],destructive:["bg-semantic-error text-white hover:bg-red-600","shadow-sm hover:shadow-md"],outline:["border border-neutral-200 bg-transparent hover:bg-neutral-50","text-neutral-900 hover:text-neutral-950"],ghost:["hover:bg-neutral-100 hover:text-neutral-900","text-neutral-600"]},Y={sm:"h-8 px-3 text-sm",md:"h-10 px-4 text-base",lg:"h-12 px-6 text-lg"},Z=ee(U,X[n],Y[e],a);return o.jsxs("button",{className:Z,ref:Q,disabled:F||y,...K,children:[y&&o.jsxs("svg",{className:"animate-spin -ml-1 mr-2 h-4 w-4",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[o.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),o.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),J]})});r.displayName="Button";r.__docgenInfo={description:"",methods:[],displayName:"Button",props:{variant:{required:!1,tsType:{name:"union",raw:"'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'destructive'"},{name:"literal",value:"'outline'"},{name:"literal",value:"'ghost'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const oe={title:"Components/Button",component:r,parameters:{layout:"centered",docs:{description:{component:"A versatile button component with multiple variants and sizes."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","primary","secondary","destructive","outline","ghost"]},size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"},loading:{control:"boolean"}}},c={args:{children:"Button",variant:"default",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("bg-neutral-100"),await W.hover(e),await t(e).toHaveClass("hover:bg-neutral-200")}},i={args:{children:"Primary Button",variant:"primary",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("bg-primary-500"),await W.click(e)}},l={args:{children:"Secondary Button",variant:"secondary",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("bg-secondary-500")}},u={args:{children:"Delete",variant:"destructive",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("bg-semantic-error")}},d={args:{children:"Outline Button",variant:"outline",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("border-neutral-200")}},m={args:{children:"Ghost Button",variant:"ghost",size:"md"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeInTheDocument(),await t(e).toHaveClass("text-neutral-600")}},v={render:()=>o.jsxs("div",{className:"flex items-center gap-4",children:[o.jsx(r,{size:"sm",children:"Small"}),o.jsx(r,{size:"md",children:"Medium"}),o.jsx(r,{size:"lg",children:"Large"})]}),play:async({canvasElement:a})=>{const e=s(a).getAllByRole("button");await t(e[0]).toHaveClass("h-8"),await t(e[1]).toHaveClass("h-10"),await t(e[2]).toHaveClass("h-12")}},p={args:{children:"Loading",loading:!0,variant:"primary"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeDisabled(),await t(e.querySelector("svg")).toBeInTheDocument()}},b={args:{children:"Disabled",disabled:!0,variant:"primary"},play:async({canvasElement:a})=>{const e=s(a).getByRole("button");await t(e).toBeDisabled(),await t(e).toHaveClass("opacity-50")}};var h,g,w;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-neutral-100');

    // Test hover interaction
    await userEvent.hover(button);
    await expect(button).toHaveClass('hover:bg-neutral-200');
  }
}`,...(w=(g=c.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};var B,x,f;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-primary-500');

    // Test click interaction
    await userEvent.click(button);
  }
}`,...(f=(x=i.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var D,z,C;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-secondary-500');
  }
}`,...(C=(z=l.parameters)==null?void 0:z.docs)==null?void 0:C.source}}};var R,E,H;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    children: 'Delete',
    variant: 'destructive',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('bg-semantic-error');
  }
}`,...(H=(E=u.parameters)==null?void 0:E.docs)==null?void 0:H.source}}};var S,T,I;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('border-neutral-200');
  }
}`,...(I=(T=d.parameters)==null?void 0:T.docs)==null?void 0:I.source}}};var j,N,q;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveClass('text-neutral-600');
  }
}`,...(q=(N=m.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var L,k,O;v.parameters={...v.parameters,docs:{...(L=v.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons[0]).toHaveClass('h-8');
    await expect(buttons[1]).toHaveClass('h-10');
    await expect(buttons[2]).toHaveClass('h-12');
  }
}`,...(O=(k=v.parameters)==null?void 0:k.docs)==null?void 0:O.source}}};var V,A,G;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    children: 'Loading',
    loading: true,
    variant: 'primary'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button.querySelector('svg')).toBeInTheDocument();
  }
}`,...(G=(A=p.parameters)==null?void 0:A.docs)==null?void 0:G.source}}};var P,_,M;b.parameters={...b.parameters,docs:{...(P=b.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveClass('opacity-50');
  }
}`,...(M=(_=b.parameters)==null?void 0:_.docs)==null?void 0:M.source}}};const re=["Default","Primary","Secondary","Destructive","Outline","Ghost","Sizes","Loading","Disabled"];export{c as Default,u as Destructive,b as Disabled,m as Ghost,p as Loading,d as Outline,i as Primary,l as Secondary,v as Sizes,re as __namedExportsOrder,oe as default};
