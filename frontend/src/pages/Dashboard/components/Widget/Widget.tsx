import { Card } from 'components/Card';
import { WidgetType } from 'types/widget.types';

export const Widget = ({
  title,
  description,
  reference,
  anchor,
  widget: MxWidget,
  props = {}
}: WidgetType) => {
  return (
    <Card
      title={title}
      description={description}
      // @ts-ignore
      reference={reference}
      anchor={anchor}
    >
      <MxWidget {...props} />
    </Card>
  );
};
