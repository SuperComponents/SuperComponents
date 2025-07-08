import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{w as d,u,e as r}from"./index-BavEqKhC.js";import{r as b}from"./index-D4lIrffr.js";import{r as ce}from"./index-Dc97iC8r.js";import{c as p}from"./cn-BaF2GUMg.js";import"./index-DsJinFGm.js";const oe=({isOpen:t,onClose:a,size:o="md",variant:n="default",closeOnOverlayClick:h=!0,closeOnEscape:y=!0,showCloseButton:ae=!0,className:ne,children:re})=>{const v=b.useRef(null),B=b.useRef(null);b.useEffect(()=>{if(!y)return;const c=x=>{x.key==="Escape"&&t&&a()};return t&&document.addEventListener("keydown",c),()=>{document.removeEventListener("keydown",c)}},[t,a,y]),b.useEffect(()=>(t?(B.current=document.activeElement,v.current&&v.current.focus(),document.body.style.overflow="hidden"):(B.current&&B.current.focus(),document.body.style.overflow="unset"),()=>{document.body.style.overflow="unset"}),[t]),b.useEffect(()=>{if(!t)return;const c=x=>{if(x.key!=="Tab")return;const T=v.current;if(!T)return;const S=T.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),E=S[0],k=S[S.length-1];x.shiftKey?document.activeElement===E&&(k.focus(),x.preventDefault()):document.activeElement===k&&(E.focus(),x.preventDefault())};return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[t]);const se=c=>{h&&c.target===c.currentTarget&&a()},le=p("fixed inset-0 bg-black/50 flex items-center justify-center z-50","transition-opacity duration-200",n==="top"&&"items-start pt-20"),ie=p("bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden","transform transition-all duration-200","focus:outline-none focus:ring-2 focus:ring-primary-500",{sm:"max-w-sm",md:"max-w-md",lg:"max-w-lg",xl:"max-w-xl",full:"max-w-full mx-4"}[o],"w-full mx-4",ne);return t?ce.createPortal(e.jsx("div",{className:le,onClick:se,"aria-modal":"true",role:"dialog","aria-labelledby":"modal-title",children:e.jsxs("div",{ref:v,className:ie,tabIndex:-1,children:[ae&&e.jsx("button",{onClick:a,className:p("absolute top-4 right-4 p-1 rounded-md","text-neutral-400 hover:text-neutral-600","hover:bg-neutral-100 transition-colors","focus:outline-none focus:ring-2 focus:ring-primary-500"),"aria-label":"Close modal",children:e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})}),re]})}),document.body):null},s=({className:t,children:a,onClose:o,...n})=>e.jsxs("div",{className:p("flex items-center justify-between p-6 border-b border-neutral-200",t),...n,children:[e.jsx("div",{className:"flex-1 pr-4",children:a}),o&&e.jsx("button",{onClick:o,className:p("p-1 rounded-md text-neutral-400 hover:text-neutral-600","hover:bg-neutral-100 transition-colors","focus:outline-none focus:ring-2 focus:ring-primary-500"),"aria-label":"Close modal",children:e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]});s.displayName="ModalHeader";const l=({className:t,children:a,...o})=>e.jsx("div",{className:p("p-6 overflow-y-auto",t),...o,children:a});l.displayName="ModalContent";const i=({className:t,children:a,...o})=>e.jsx("div",{className:p("flex items-center justify-end space-x-2 p-6 border-t border-neutral-200",t),...o,children:a});i.displayName="ModalFooter";s.__docgenInfo={description:"",methods:[],displayName:"ModalHeader",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};l.__docgenInfo={description:"",methods:[],displayName:"ModalContent",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};i.__docgenInfo={description:"",methods:[],displayName:"ModalFooter",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const ye={title:"Components/Modal",component:oe,parameters:{layout:"centered",docs:{description:{component:"A flexible modal component with header, content, and footer sections."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg","xl","full"]},variant:{control:"select",options:["default","centered","top"]},closeOnOverlayClick:{control:"boolean"},closeOnEscape:{control:"boolean"},showCloseButton:{control:"boolean"}}},m=({children:t,...a})=>{const[o,n]=b.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>n(!0),className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Open Modal"}),e.jsx(oe,{...a,isOpen:o,onClose:()=>n(!1),children:t})]})},f={render:t=>e.jsxs(m,{...t,children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"Default Modal"})}),e.jsx(l,{children:e.jsx("p",{children:"This is the default modal content. It can contain any React elements."})}),e.jsxs(i,{children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Cancel"}),e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Confirm"})]})]}),args:{size:"md",variant:"default",closeOnOverlayClick:!0,closeOnEscape:!0,showCloseButton:!0},play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o),await r(document.querySelector('[role="dialog"]')).toBeInTheDocument()}},g={render:()=>e.jsxs(m,{size:"sm",children:[e.jsx(s,{children:e.jsx("h2",{className:"text-lg font-semibold",children:"Small Modal"})}),e.jsx(l,{children:e.jsx("p",{children:"This is a small modal with limited content."})}),e.jsx(i,{children:e.jsx("button",{className:"px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"OK"})})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o);const n=document.querySelector('[role="dialog"]');await r(n).toHaveClass("max-w-sm")}},w={render:()=>e.jsxs(m,{size:"lg",children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"Large Modal"})}),e.jsxs(l,{children:[e.jsx("p",{children:"This is a large modal with more content space."}),e.jsx("p",{children:"It can contain multiple paragraphs and more complex layouts."}),e.jsxs("div",{className:"mt-4 p-4 bg-neutral-50 rounded-md",children:[e.jsx("h3",{className:"font-medium mb-2",children:"Additional Content"}),e.jsx("p",{children:"More content can be added here as needed."})]})]}),e.jsxs(i,{children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Cancel"}),e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Save"})]})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o);const n=document.querySelector('[role="dialog"]');await r(n).toHaveClass("max-w-lg")}},M={render:()=>e.jsxs(m,{variant:"top",children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"Top Aligned Modal"})}),e.jsx(l,{children:e.jsx("p",{children:"This modal appears at the top of the screen instead of being centered."})}),e.jsx(i,{children:e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"OK"})})]}),play:async({canvasElement:t})=>{var h;const o=d(t).getByText("Open Modal");await u.click(o);const n=(h=document.querySelector('[role="dialog"]'))==null?void 0:h.parentElement;await r(n).toHaveClass("items-start","pt-20")}},j={render:()=>e.jsxs(m,{showCloseButton:!1,children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"No Close Button"})}),e.jsxs(l,{children:[e.jsx("p",{children:"This modal doesn't have a close button in the top-right corner."}),e.jsx("p",{children:"You can only close it by clicking the cancel button or pressing Escape."})]}),e.jsx(i,{children:e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Cancel"})})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o),await r(document.querySelector('[aria-label="Close modal"]')).not.toBeInTheDocument()}},N={render:()=>e.jsxs(m,{size:"sm",closeOnOverlayClick:!1,children:[e.jsx(s,{children:e.jsx("h2",{className:"text-lg font-semibold text-semantic-error",children:"Delete Item"})}),e.jsx(l,{children:e.jsx("p",{children:"Are you sure you want to delete this item? This action cannot be undone."})}),e.jsxs(i,{children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Cancel"}),e.jsx("button",{className:"px-4 py-2 bg-semantic-error text-white rounded-md hover:bg-red-600",children:"Delete"})]})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o),await r(document.querySelector('[role="dialog"]')).toBeInTheDocument(),await r(document.querySelector(".text-semantic-error")).toBeInTheDocument()}},q={render:()=>e.jsxs(m,{size:"md",children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"User Profile"})}),e.jsx(l,{children:e.jsxs("form",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-neutral-700 mb-1",children:"Name"}),e.jsx("input",{type:"text",className:"w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",placeholder:"Enter your name"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-neutral-700 mb-1",children:"Email"}),e.jsx("input",{type:"email",className:"w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",placeholder:"Enter your email"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-neutral-700 mb-1",children:"Bio"}),e.jsx("textarea",{className:"w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",rows:3,placeholder:"Tell us about yourself"})]})]})}),e.jsxs(i,{children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Cancel"}),e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Save Profile"})]})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o);const n=document.querySelector('input[placeholder="Enter your name"]'),h=document.querySelector('input[placeholder="Enter your email"]'),y=document.querySelector('textarea[placeholder="Tell us about yourself"]');await r(n).toBeInTheDocument(),await r(h).toBeInTheDocument(),await r(y).toBeInTheDocument()}},C={render:()=>e.jsxs(m,{size:"lg",children:[e.jsx(s,{children:e.jsx("h2",{className:"text-xl font-semibold",children:"Terms of Service"})}),e.jsx(l,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}),e.jsx("p",{children:"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}),e.jsx("p",{children:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}),e.jsx("p",{children:"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}),e.jsx("p",{children:"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."}),e.jsx("p",{children:"Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."}),e.jsx("p",{children:"Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos."}),e.jsx("p",{children:"Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet."}),e.jsx("p",{children:"Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."}),e.jsx("p",{children:"Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur."})]})}),e.jsxs(i,{children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Decline"}),e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Accept"})]})]}),play:async({canvasElement:t})=>{const o=d(t).getByText("Open Modal");await u.click(o);const n=document.querySelector(".overflow-y-auto");await r(n).toBeInTheDocument()}};var D,I,O;f.parameters={...f.parameters,docs:{...(D=f.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: args => <ModalWithState {...args}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">Default Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is the default modal content. It can contain any React elements.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Confirm
        </button>
      </ModalFooter>
    </ModalWithState>,
  args: {
    size: 'md',
    variant: 'default',
    closeOnOverlayClick: true,
    closeOnEscape: true,
    showCloseButton: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);

    // Modal should be open
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  }
}`,...(O=(I=f.parameters)==null?void 0:I.docs)==null?void 0:O.source}}};var H,F,W;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <ModalWithState size="sm">
      <ModalHeader>
        <h2 className="text-lg font-semibold">Small Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a small modal with limited content.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-sm');
  }
}`,...(W=(F=g.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var L,R,z;w.parameters={...w.parameters,docs:{...(L=w.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Large Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This is a large modal with more content space.</p>
        <p>It can contain multiple paragraphs and more complex layouts.</p>
        <div className="mt-4 p-4 bg-neutral-50 rounded-md">
          <h3 className="font-medium mb-2">Additional Content</h3>
          <p>More content can be added here as needed.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);
    const modal = document.querySelector('[role="dialog"]');
    await expect(modal).toHaveClass('max-w-lg');
  }
}`,...(z=(R=w.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};var A,_,K;M.parameters={...M.parameters,docs:{...(A=M.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <ModalWithState variant="top">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Top Aligned Modal</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal appears at the top of the screen instead of being centered.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          OK
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);
    const modalOverlay = document.querySelector('[role="dialog"]')?.parentElement;
    await expect(modalOverlay).toHaveClass('items-start', 'pt-20');
  }
}`,...(K=(_=M.parameters)==null?void 0:_.docs)==null?void 0:K.source}}};var U,P,Q;j.parameters={...j.parameters,docs:{...(U=j.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <ModalWithState showCloseButton={false}>
      <ModalHeader>
        <h2 className="text-xl font-semibold">No Close Button</h2>
      </ModalHeader>
      <ModalContent>
        <p>This modal doesn't have a close button in the top-right corner.</p>
        <p>You can only close it by clicking the cancel button or pressing Escape.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);

    // Should not have close button
    await expect(document.querySelector('[aria-label="Close modal"]')).not.toBeInTheDocument();
  }
}`,...(Q=(P=j.parameters)==null?void 0:P.docs)==null?void 0:Q.source}}};var Y,G,J;N.parameters={...N.parameters,docs:{...(Y=N.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <ModalWithState size="sm" closeOnOverlayClick={false}>
      <ModalHeader>
        <h2 className="text-lg font-semibold text-semantic-error">Delete Item</h2>
      </ModalHeader>
      <ModalContent>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-semantic-error text-white rounded-md hover:bg-red-600">
          Delete
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);
    await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    await expect(document.querySelector('.text-semantic-error')).toBeInTheDocument();
  }
}`,...(J=(G=N.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};var V,X,Z;q.parameters={...q.parameters,docs:{...(V=q.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <ModalWithState size="md">
      <ModalHeader>
        <h2 className="text-xl font-semibold">User Profile</h2>
      </ModalHeader>
      <ModalContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Name
            </label>
            <input type="text" className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input type="email" className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bio
            </label>
            <textarea className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} placeholder="Tell us about yourself" />
          </div>
        </form>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Save Profile
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);

    // Check if form elements are present
    const nameInput = document.querySelector('input[placeholder="Enter your name"]');
    const emailInput = document.querySelector('input[placeholder="Enter your email"]');
    const bioTextarea = document.querySelector('textarea[placeholder="Tell us about yourself"]');
    await expect(nameInput).toBeInTheDocument();
    await expect(emailInput).toBeInTheDocument();
    await expect(bioTextarea).toBeInTheDocument();
  }
}`,...(Z=(X=q.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var $,ee,te;C.parameters={...C.parameters,docs:{...($=C.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: () => <ModalWithState size="lg">
      <ModalHeader>
        <h2 className="text-xl font-semibold">Terms of Service</h2>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.</p>
          <p>Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
          <p>Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
          <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Decline
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Accept
        </button>
      </ModalFooter>
    </ModalWithState>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByText('Open Modal');
    await userEvent.click(openButton);

    // Check if content is scrollable
    const modalContent = document.querySelector('.overflow-y-auto');
    await expect(modalContent).toBeInTheDocument();
  }
}`,...(te=(ee=C.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};const ve=["Default","Small","Large","TopAligned","WithoutCloseButton","ConfirmationDialog","FormModal","LongContent"];export{N as ConfirmationDialog,f as Default,q as FormModal,w as Large,C as LongContent,g as Small,M as TopAligned,j as WithoutCloseButton,ve as __namedExportsOrder,ye as default};
