import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{w as c,e as s,u as ne}from"./index-BavEqKhC.js";import{R as y}from"./index-D4lIrffr.js";import{c as C}from"./cn-BaF2GUMg.js";const r=y.forwardRef(({className:n,variant:a="default",padding:t="md",interactive:o=!1,children:Q,...U},X)=>{const Y=["rounded-lg transition-all duration-200","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2","focus-visible:ring-primary-500"],Z={default:["bg-white border border-neutral-200","hover:border-neutral-300"],outlined:["bg-white border-2 border-neutral-200","hover:border-neutral-300"],elevated:["bg-white shadow-md border border-neutral-100","hover:shadow-lg"],ghost:["bg-neutral-50 border border-transparent","hover:bg-neutral-100"]},ee={none:"",sm:"p-3",md:"p-4",lg:"p-6"},ae=o?["cursor-pointer hover:scale-[1.02] active:scale-[0.98]","focus:scale-[1.02]"]:[],te=C(Y,Z[a],ee[t],ae,n);return e.jsx("div",{ref:X,className:te,tabIndex:o?0:void 0,role:o?"button":void 0,...U,children:Q})});r.displayName="Card";const d=y.forwardRef(({className:n,children:a,...t},o)=>e.jsx("div",{ref:o,className:C("flex flex-col space-y-1.5 pb-4",n),...t,children:a}));d.displayName="CardHeader";const i=y.forwardRef(({className:n,children:a,...t},o)=>e.jsx("div",{ref:o,className:C("text-neutral-700",n),...t,children:a}));i.displayName="CardContent";const l=y.forwardRef(({className:n,children:a,...t},o)=>e.jsx("div",{ref:o,className:C("flex items-center pt-4",n),...t,children:a}));l.displayName="CardFooter";r.__docgenInfo={description:"",methods:[],displayName:"Card",props:{variant:{required:!1,tsType:{name:"union",raw:"'default' | 'outlined' | 'elevated' | 'ghost'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'outlined'"},{name:"literal",value:"'elevated'"},{name:"literal",value:"'ghost'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},padding:{required:!1,tsType:{name:"union",raw:"'none' | 'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'none'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},interactive:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};d.__docgenInfo={description:"",methods:[],displayName:"CardHeader",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};i.__docgenInfo={description:"",methods:[],displayName:"CardContent",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};l.__docgenInfo={description:"",methods:[],displayName:"CardFooter",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const de={title:"Components/Card",component:r,parameters:{layout:"centered",docs:{description:{component:"A flexible card component with header, content, and footer sections."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","outlined","elevated","ghost"]},padding:{control:"select",options:["none","sm","md","lg"]},interactive:{control:"boolean"}}},m={args:{children:"This is a default card with some content.",variant:"default",padding:"md"},play:async({canvasElement:n})=>{const t=c(n).getByText("This is a default card with some content.");await s(t).toBeInTheDocument(),await s(t).toHaveClass("bg-white","border-neutral-200")}},u={render:()=>e.jsxs(r,{className:"w-80",children:[e.jsxs(d,{children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Card Title"}),e.jsx("p",{className:"text-sm text-neutral-500",children:"Card subtitle"})]}),e.jsx(i,{children:e.jsx("p",{children:"This is the main content of the card. It can contain any React elements."})}),e.jsx(l,{children:e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Action"})})]}),play:async({canvasElement:n})=>{const a=c(n);await s(a.getByText("Card Title")).toBeInTheDocument(),await s(a.getByText("Card subtitle")).toBeInTheDocument(),await s(a.getByText("This is the main content of the card. It can contain any React elements.")).toBeInTheDocument(),await s(a.getByRole("button",{name:"Action"})).toBeInTheDocument()}},p={args:{variant:"outlined",children:"This is an outlined card.",className:"w-64"},play:async({canvasElement:n})=>{const t=c(n).getByText("This is an outlined card.");await s(t).toHaveClass("border-2","border-neutral-200")}},h={args:{variant:"elevated",children:"This is an elevated card with shadow.",className:"w-64"},play:async({canvasElement:n})=>{const t=c(n).getByText("This is an elevated card with shadow.");await s(t).toHaveClass("shadow-md")}},v={args:{variant:"ghost",children:"This is a ghost card with subtle background.",className:"w-64"},play:async({canvasElement:n})=>{const t=c(n).getByText("This is a ghost card with subtle background.");await s(t).toHaveClass("bg-neutral-50")}},g={args:{interactive:!0,children:"This is an interactive card. Click me!",className:"w-64",onClick:()=>console.log("Card clicked!")},play:async({canvasElement:n})=>{const t=c(n).getByText("This is an interactive card. Click me!");await s(t).toHaveClass("cursor-pointer"),await s(t).toHaveAttribute("tabIndex","0"),await s(t).toHaveAttribute("role","button"),await ne.click(t)}},x={render:()=>e.jsxs("div",{className:"space-y-4 w-64",children:[e.jsx(r,{padding:"none",variant:"outlined",children:e.jsx("div",{className:"p-2 bg-neutral-100 text-sm",children:"No padding"})}),e.jsx(r,{padding:"sm",variant:"outlined",children:e.jsx("div",{className:"bg-neutral-100 text-sm",children:"Small padding"})}),e.jsx(r,{padding:"md",variant:"outlined",children:e.jsx("div",{className:"bg-neutral-100 text-sm",children:"Medium padding"})}),e.jsx(r,{padding:"lg",variant:"outlined",children:e.jsx("div",{className:"bg-neutral-100 text-sm",children:"Large padding"})})]}),play:async({canvasElement:n})=>{const t=c(n).getAllByText(/padding/);await s(t[0].closest('[class*="p-"]')).not.toHaveClass("p-3","p-4","p-6"),await s(t[1].closest('[class*="p-"]')).toHaveClass("p-3"),await s(t[2].closest('[class*="p-"]')).toHaveClass("p-4"),await s(t[3].closest('[class*="p-"]')).toHaveClass("p-6")}},b={render:()=>e.jsxs(r,{variant:"elevated",className:"w-80",children:[e.jsx(d,{children:e.jsx("img",{src:"https://via.placeholder.com/320x180",alt:"Product",className:"w-full h-32 object-cover rounded-t-lg -m-4 mb-0"})}),e.jsxs(i,{children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Product Title"}),e.jsx("p",{className:"text-neutral-600 mb-2",children:"This is a detailed description of the product with its key features and benefits."}),e.jsx("div",{className:"text-2xl font-bold text-primary-600",children:"$99.99"})]}),e.jsxs(l,{className:"justify-between",children:[e.jsx("button",{className:"px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50",children:"Add to Cart"}),e.jsx("button",{className:"px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Buy Now"})]})]}),play:async({canvasElement:n})=>{const a=c(n);await s(a.getByText("Product Title")).toBeInTheDocument(),await s(a.getByText("$99.99")).toBeInTheDocument(),await s(a.getByRole("button",{name:"Add to Cart"})).toBeInTheDocument(),await s(a.getByRole("button",{name:"Buy Now"})).toBeInTheDocument()}},w={render:()=>e.jsxs(r,{variant:"outlined",className:"w-80",children:[e.jsx(d,{children:e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold",children:"JD"}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold",children:"John Doe"}),e.jsx("p",{className:"text-sm text-neutral-500",children:"Software Engineer"})]})]})}),e.jsx(i,{children:e.jsx("p",{className:"text-neutral-600",children:"Passionate about creating great user experiences and building scalable applications."})}),e.jsx(l,{children:e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("button",{className:"px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200",children:"Follow"}),e.jsx("button",{className:"px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600",children:"Message"})]})})]}),play:async({canvasElement:n})=>{const a=c(n);await s(a.getByText("John Doe")).toBeInTheDocument(),await s(a.getByText("Software Engineer")).toBeInTheDocument(),await s(a.getByRole("button",{name:"Follow"})).toBeInTheDocument(),await s(a.getByRole("button",{name:"Message"})).toBeInTheDocument()}};var T,f,N;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    children: 'This is a default card with some content.',
    variant: 'default',
    padding: 'md'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is a default card with some content.');
    await expect(card).toBeInTheDocument();
    await expect(card).toHaveClass('bg-white', 'border-neutral-200');
  }
}`,...(N=(f=m.parameters)==null?void 0:f.docs)==null?void 0:N.source}}};var B,j,I;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-sm text-neutral-500">Card subtitle</p>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card. It can contain any React elements.</p>
      </CardContent>
      <CardFooter>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Action
        </button>
      </CardFooter>
    </Card>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Card Title')).toBeInTheDocument();
    await expect(canvas.getByText('Card subtitle')).toBeInTheDocument();
    await expect(canvas.getByText('This is the main content of the card. It can contain any React elements.')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Action'
    })).toBeInTheDocument();
  }
}`,...(I=(j=u.parameters)==null?void 0:j.docs)==null?void 0:I.source}}};var R,D,H;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    variant: 'outlined',
    children: 'This is an outlined card.',
    className: 'w-64'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an outlined card.');
    await expect(card).toHaveClass('border-2', 'border-neutral-200');
  }
}`,...(H=(D=p.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var E,S,k;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    variant: 'elevated',
    children: 'This is an elevated card with shadow.',
    className: 'w-64'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an elevated card with shadow.');
    await expect(card).toHaveClass('shadow-md');
  }
}`,...(k=(S=h.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var A,P,F;v.parameters={...v.parameters,docs:{...(A=v.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'This is a ghost card with subtle background.',
    className: 'w-64'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is a ghost card with subtle background.');
    await expect(card).toHaveClass('bg-neutral-50');
  }
}`,...(F=(P=v.parameters)==null?void 0:P.docs)==null?void 0:F.source}}};var _,q,J;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    interactive: true,
    children: 'This is an interactive card. Click me!',
    className: 'w-64',
    onClick: () => console.log('Card clicked!')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('This is an interactive card. Click me!');
    await expect(card).toHaveClass('cursor-pointer');
    await expect(card).toHaveAttribute('tabIndex', '0');
    await expect(card).toHaveAttribute('role', 'button');

    // Test click interaction
    await userEvent.click(card);
  }
}`,...(J=(q=g.parameters)==null?void 0:q.docs)==null?void 0:J.source}}};var M,V,$;x.parameters={...x.parameters,docs:{...(M=x.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 w-64">
      <Card padding="none" variant="outlined">
        <div className="p-2 bg-neutral-100 text-sm">No padding</div>
      </Card>
      <Card padding="sm" variant="outlined">
        <div className="bg-neutral-100 text-sm">Small padding</div>
      </Card>
      <Card padding="md" variant="outlined">
        <div className="bg-neutral-100 text-sm">Medium padding</div>
      </Card>
      <Card padding="lg" variant="outlined">
        <div className="bg-neutral-100 text-sm">Large padding</div>
      </Card>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByText(/padding/);
    await expect(cards[0].closest('[class*="p-"]')).not.toHaveClass('p-3', 'p-4', 'p-6');
    await expect(cards[1].closest('[class*="p-"]')).toHaveClass('p-3');
    await expect(cards[2].closest('[class*="p-"]')).toHaveClass('p-4');
    await expect(cards[3].closest('[class*="p-"]')).toHaveClass('p-6');
  }
}`,...($=(V=x.parameters)==null?void 0:V.docs)==null?void 0:$.source}}};var O,G,L;b.parameters={...b.parameters,docs:{...(O=b.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <Card variant="elevated" className="w-80">
      <CardHeader>
        <img src="https://via.placeholder.com/320x180" alt="Product" className="w-full h-32 object-cover rounded-t-lg -m-4 mb-0" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Product Title</h3>
        <p className="text-neutral-600 mb-2">
          This is a detailed description of the product with its key features and benefits.
        </p>
        <div className="text-2xl font-bold text-primary-600">$99.99</div>
      </CardContent>
      <CardFooter className="justify-between">
        <button className="px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50">
          Add to Cart
        </button>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
          Buy Now
        </button>
      </CardFooter>
    </Card>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Product Title')).toBeInTheDocument();
    await expect(canvas.getByText('$99.99')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Add to Cart'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Buy Now'
    })).toBeInTheDocument();
  }
}`,...(L=(G=b.parameters)==null?void 0:G.docs)==null?void 0:L.source}}};var W,z,K;w.parameters={...w.parameters,docs:{...(W=w.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <Card variant="outlined" className="w-80">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <h3 className="text-lg font-semibold">John Doe</h3>
            <p className="text-sm text-neutral-500">Software Engineer</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">
          Passionate about creating great user experiences and building scalable applications.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200">
            Follow
          </button>
          <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600">
            Message
          </button>
        </div>
      </CardFooter>
    </Card>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('John Doe')).toBeInTheDocument();
    await expect(canvas.getByText('Software Engineer')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Follow'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Message'
    })).toBeInTheDocument();
  }
}`,...(K=(z=w.parameters)==null?void 0:z.docs)==null?void 0:K.source}}};const ie=["Default","WithStructure","Outlined","Elevated","Ghost","Interactive","PaddingVariants","ProductCard","ProfileCard"];export{m as Default,h as Elevated,v as Ghost,g as Interactive,p as Outlined,x as PaddingVariants,b as ProductCard,w as ProfileCard,u as WithStructure,ie as __namedExportsOrder,de as default};
