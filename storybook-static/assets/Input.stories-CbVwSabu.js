import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{w as o,e as t,u as de}from"./index-BavEqKhC.js";import{R as C}from"./index-D4lIrffr.js";import{c}from"./cn-BaF2GUMg.js";const l=C.forwardRef(({className:s,variant:n="default",size:e="md",fullWidth:r=!1,label:j,error:i,helperText:f,startIcon:g,endIcon:B,id:te,...se},ne)=>{const d=te||C.useId(),E=i?`${d}-error`:void 0,T=f?`${d}-helper`:void 0,H=i?"error":n,re=["flex rounded-md border bg-white px-3 py-2 text-sm","ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium","placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2","focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50","transition-colors duration-200"],oe={default:["border-neutral-200 focus-visible:ring-primary-500","hover:border-neutral-300 focus:border-primary-500"],error:["border-semantic-error focus-visible:ring-semantic-error","hover:border-red-400 focus:border-semantic-error"],success:["border-semantic-success focus-visible:ring-semantic-success","hover:border-green-400 focus:border-semantic-success"]},le={sm:"h-8 px-2 text-sm",md:"h-10 px-3 text-base",lg:"h-12 px-4 text-lg"},ce=c("relative",r&&"w-full"),ie=c(re,oe[H],le[e],g&&"pl-10",B&&"pr-10",r&&"w-full",s),R=c("absolute top-1/2 transform -translate-y-1/2 text-neutral-400",e==="sm"&&"w-4 h-4",e==="md"&&"w-5 h-5",e==="lg"&&"w-6 h-6");return a.jsxs("div",{className:ce,children:[j&&a.jsx("label",{htmlFor:d,className:c("block text-sm font-medium mb-2",H==="error"?"text-semantic-error":"text-neutral-700"),children:j}),a.jsxs("div",{className:"relative",children:[g&&a.jsx("div",{className:c(R,"left-3"),children:g}),a.jsx("input",{ref:ne,id:d,className:ie,"aria-describedby":c(E,T),"aria-invalid":H==="error"?"true":"false",...se}),B&&a.jsx("div",{className:c(R,"right-3"),children:B})]}),i&&a.jsx("p",{id:E,className:"mt-1 text-sm text-semantic-error",children:i}),f&&!i&&a.jsx("p",{id:T,className:"mt-1 text-sm text-neutral-500",children:f})]})});l.displayName="Input";l.__docgenInfo={description:"",methods:[],displayName:"Input",props:{variant:{required:!1,tsType:{name:"union",raw:"'default' | 'error' | 'success'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'error'"},{name:"literal",value:"'success'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},fullWidth:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},label:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},helperText:{required:!1,tsType:{name:"string"},description:""},startIcon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},endIcon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}},composes:["Omit"]};const he={title:"Components/Input",component:l,parameters:{layout:"centered",docs:{description:{component:"A flexible input component with validation states and customization options."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","error","success"]},size:{control:"select",options:["sm","md","lg"]},fullWidth:{control:"boolean"},disabled:{control:"boolean"}}},p={args:{placeholder:"Enter text...",variant:"default",size:"md"},play:async({canvasElement:s})=>{const e=o(s).getByRole("textbox");await t(e).toBeInTheDocument(),await t(e).toHaveClass("border-neutral-200"),await de.type(e,"Hello World"),await t(e).toHaveValue("Hello World")}},u={args:{label:"Email Address",placeholder:"john@example.com",type:"email"},play:async({canvasElement:s})=>{const n=o(s),e=n.getByText("Email Address"),r=n.getByRole("textbox");await t(e).toBeInTheDocument(),await t(e).toHaveAttribute("for",r.id)}},m={args:{label:"Password",placeholder:"Enter password",type:"password",variant:"error",error:"Password must be at least 8 characters long"},play:async({canvasElement:s})=>{const n=o(s),e=n.getByRole("textbox"),r=n.getByText("Password must be at least 8 characters long");await t(e).toHaveClass("border-semantic-error"),await t(e).toHaveAttribute("aria-invalid","true"),await t(r).toBeInTheDocument()}},v={args:{label:"Username",placeholder:"Enter username",variant:"success",defaultValue:"john_doe"},play:async({canvasElement:s})=>{const e=o(s).getByRole("textbox");await t(e).toHaveClass("border-semantic-success"),await t(e).toHaveValue("john_doe")}},h={args:{label:"Bio",placeholder:"Tell us about yourself",helperText:"Write a brief description (max 160 characters)"},play:async({canvasElement:s})=>{const n=o(s),e=n.getByRole("textbox"),r=n.getByText("Write a brief description (max 160 characters)");await t(r).toBeInTheDocument(),await t(e).toHaveAttribute("aria-describedby",r.id)}},x={render:()=>a.jsxs("div",{className:"space-y-4",children:[a.jsx(l,{size:"sm",placeholder:"Small input"}),a.jsx(l,{size:"md",placeholder:"Medium input"}),a.jsx(l,{size:"lg",placeholder:"Large input"})]}),play:async({canvasElement:s})=>{const e=o(s).getAllByRole("textbox");await t(e[0]).toHaveClass("h-8"),await t(e[1]).toHaveClass("h-10"),await t(e[2]).toHaveClass("h-12")}},y={render:()=>a.jsxs("div",{className:"space-y-4 w-64",children:[a.jsx(l,{placeholder:"Search...",startIcon:a.jsx("svg",{className:"w-full h-full",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:a.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})}),a.jsx(l,{placeholder:"Password",type:"password",endIcon:a.jsxs("svg",{className:"w-full h-full",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[a.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"}),a.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"})]})})]}),play:async({canvasElement:s})=>{const e=o(s).getAllByRole("textbox");await t(e[0]).toHaveClass("pl-10"),await t(e[1]).toHaveClass("pr-10")}},b={args:{placeholder:"Full width input",fullWidth:!0},parameters:{layout:"padded"},play:async({canvasElement:s})=>{const e=o(s).getByRole("textbox");await t(e).toHaveClass("w-full")}},w={args:{placeholder:"Disabled input",disabled:!0,defaultValue:"Cannot edit this"},play:async({canvasElement:s})=>{const e=o(s).getByRole("textbox");await t(e).toBeDisabled(),await t(e).toHaveClass("opacity-50")}};var W,I,k;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...',
    variant: 'default',
    size: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass('border-neutral-200');

    // Test typing interaction
    await userEvent.type(input, 'Hello World');
    await expect(input).toHaveValue('Hello World');
  }
}`,...(k=(I=p.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var S,N,z;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    type: 'email'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email Address');
    const input = canvas.getByRole('textbox');
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveAttribute('for', input.id);
  }
}`,...(z=(N=u.parameters)==null?void 0:N.docs)==null?void 0:z.source}}};var D,L,A;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    variant: 'error',
    error: 'Password must be at least 8 characters long'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    const errorMessage = canvas.getByText('Password must be at least 8 characters long');
    await expect(input).toHaveClass('border-semantic-error');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(errorMessage).toBeInTheDocument();
  }
}`,...(A=(L=m.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var V,M,q;v.parameters={...v.parameters,docs:{...(V=v.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    variant: 'success',
    defaultValue: 'john_doe'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveClass('border-semantic-success');
    await expect(input).toHaveValue('john_doe');
  }
}`,...(q=(M=v.parameters)==null?void 0:M.docs)==null?void 0:q.source}}};var P,_,F;h.parameters={...h.parameters,docs:{...(P=h.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    helperText: 'Write a brief description (max 160 characters)'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    const helperText = canvas.getByText('Write a brief description (max 160 characters)');
    await expect(helperText).toBeInTheDocument();
    await expect(input).toHaveAttribute('aria-describedby', helperText.id);
  }
}`,...(F=(_=h.parameters)==null?void 0:_.docs)==null?void 0:F.source}}};var O,U,$;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    await expect(inputs[0]).toHaveClass('h-8');
    await expect(inputs[1]).toHaveClass('h-10');
    await expect(inputs[2]).toHaveClass('h-12');
  }
}`,...($=(U=x.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};var G,J,K;y.parameters={...y.parameters,docs:{...(G=y.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 w-64">
      <Input placeholder="Search..." startIcon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>} />
      <Input placeholder="Password" type="password" endIcon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    await expect(inputs[0]).toHaveClass('pl-10');
    await expect(inputs[1]).toHaveClass('pr-10');
  }
}`,...(K=(J=y.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,X,Y;b.parameters={...b.parameters,docs:{...(Q=b.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    placeholder: 'Full width input',
    fullWidth: true
  },
  parameters: {
    layout: 'padded'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveClass('w-full');
  }
}`,...(Y=(X=b.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,ae;w.parameters={...w.parameters,docs:{...(Z=w.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit this'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeDisabled();
    await expect(input).toHaveClass('opacity-50');
  }
}`,...(ae=(ee=w.parameters)==null?void 0:ee.docs)==null?void 0:ae.source}}};const xe=["Default","WithLabel","WithError","WithSuccess","WithHelperText","Sizes","WithIcons","FullWidth","Disabled"];export{p as Default,w as Disabled,b as FullWidth,x as Sizes,m as WithError,h as WithHelperText,y as WithIcons,u as WithLabel,v as WithSuccess,xe as __namedExportsOrder,he as default};
