interface IHeading {
  heading: string;
}
export const PageSubHeading = ({heading}: IHeading) => (
  <h3 className="text-sm font-semibold capitalize">{heading}</h3>
);
