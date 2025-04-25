interface IHeading {
  heading: string;
}
export const PageSubHeading = ({ heading }: IHeading) => (
  <h3 className="font-semibold text-sm capitalize">{heading}</h3>
);
