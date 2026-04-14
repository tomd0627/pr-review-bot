import type { Finding } from "./types";

export const SAMPLE_FINDINGS: Finding[] = [
  {
    file: "src/components/ProductCard.tsx",
    line: 15,
    severity: "critical",
    category: "accessibility",
    criterion: "WCAG 2.1.1",
    title: "Click handler on non-interactive element",
    message:
      "The outer <div> has an onClick handler making the card navigable, but <div> is not a natively interactive element. Keyboard users cannot Tab to it or activate it with Enter/Space, and screen readers will not announce it as a link.",
    suggestion:
      'Replace the <div> wrapper with an <a href={`/product/${product.id}`}> element. Move any inner button stopPropagation calls to the link\'s onClick if needed, or restructure so the link wraps only the non-interactive content.',
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 16,
    severity: "critical",
    category: "accessibility",
    criterion: "WCAG 1.1.1",
    title: "Image missing alt attribute",
    message:
      "The <img> element has no alt attribute. Screen readers will announce the raw image URL as the accessible name, which is meaningless to users. This also fails WCAG 1.1.1 (Non-text Content).",
    suggestion:
      'Add a descriptive alt attribute: alt={`${product.name} product image`}. If the image is decorative and the product name is already displayed elsewhere, use alt="" to mark it as presentational.',
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 18,
    severity: "major",
    category: "accessibility",
    criterion: "WCAG 1.4.3",
    title: "Insufficient color contrast on product name",
    message:
      "The inline color #aaaaaa on a typical white/light card background yields a contrast ratio of ~2.32:1. WCAG 1.4.3 requires a minimum 4.5:1 for normal text. This fails both AA and AAA.",
    suggestion:
      "Remove the inline style and use a design-system token that meets contrast requirements. For a white background, #767676 is the lightest grey that passes AA (4.54:1). Prefer #595959 (7:1) for comfortable reading.",
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 20,
    severity: "major",
    category: "accessibility",
    criterion: "WCAG 1.3.1",
    title: "Star rating has no accessible label",
    message:
      'The rating renders five Unicode ★ characters. Screen readers will read "star star star star star" with no indication of the actual score. The yellow/grey color distinction is also invisible to colour-blind users.',
    suggestion:
      'Add aria-label to the container: <div className="rating" aria-label={`Rating: ${product.rating} out of 5`} role="img">. Alternatively, add a visually-hidden <span className="sr-only">{product.rating} out of 5 stars</span> inside.',
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 26,
    severity: "critical",
    category: "accessibility",
    criterion: "WCAG 4.1.2",
    title: 'Quantity buttons have no accessible names',
    message:
      'The decrement and increment buttons contain only "-" and "+" characters. These are not meaningful accessible names — assistive technology will announce them as "minus button" or "plus sign button", giving no context about their purpose.',
    suggestion:
      'Add aria-label to both buttons: <button aria-label="Decrease quantity">-</button> and <button aria-label="Increase quantity">+</button>.',
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 27,
    severity: "major",
    category: "accessibility",
    criterion: "WCAG 1.3.1",
    title: "Number input is missing an accessible label",
    message:
      "The <input type=\"number\"> has no associated <label> and no aria-label or aria-labelledby attribute. Screen readers cannot tell users what this field controls. It will typically be announced as just 'number field'.",
    suggestion:
      'Add a visible or visually-hidden label: <label htmlFor="qty">Quantity</label> <input id="qty" ... />, or use aria-label="Quantity" directly on the input.',
  },
  {
    file: "src/components/ProductCard.tsx",
    line: 41,
    severity: "minor",
    category: "quality",
    title: "Cart request has no error handling",
    message:
      "The fetch() call in addToCart does not handle network failures or non-2xx HTTP responses. A failed request will silently do nothing — the user receives no feedback that their item wasn't added.",
    suggestion:
      "Add .then(res => { if (!res.ok) throw new Error(res.statusText); }).catch(err => { /* surface error to user */ }). Consider propagating the result back to the component to show a loading/success/error state.",
  },
];
