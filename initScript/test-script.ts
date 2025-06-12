/* eslint-disable @typescript-eslint/no-unused-vars */
type Variant = {
  value: string;
  options: string[];
};
type SKU = {
  value: string;
  price: number;
  stock: number;
  image: string;
};
type Data = {
  product: {
    publishedAt: string | null;
    name: string;
    base_price: number;
    virtual_price: number;
    brandId: number;
    images: string[];
    variants: Variant[];
    categories: number[];
  };
  skus: SKU[];
};

function generateSkus(variants: Variant[]): SKU[] {
  function getComninations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)),
      [''],
    );
  }
  const options = variants.map((variant) => variant.options);
  const combinations = getComninations(options);
  return combinations.map((combination) => ({
    value: combination,
    price: 0,
    stock: 100,
    image: '',
  }));
}
