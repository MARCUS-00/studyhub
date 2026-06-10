interface Props {
  readonly children: React.ReactNode;
}

export default function AttendTestLayout({ children }: Props) {
  return <div>{children}</div>;
}
