import { MoreHorizontal } from 'lucide-react';
import { Dropdown, DropdownItem, DropdownSeparator } from './Dropdown';

/**
 * Icon-only row action menu.
 * items: [{ id, label, icon?, onSelect?, danger?, disabled?, separator? }]
 */
export function Menu({ items = [], label = 'Row actions', align = 'end', className, width = 'w-52' }) {
  return (
    <Dropdown
      align={align}
      label={label}
      width={width}
      className={className}
      trigger={<MoreHorizontal className="h-4 w-4" aria-hidden />}
    >
      {items.map((item, index) =>
        item.separator ? (
          <DropdownSeparator key={`sep-${index}`} />
        ) : (
          <DropdownItem
            key={item.id ?? item.label}
            icon={item.icon}
            danger={item.danger}
            disabled={item.disabled}
            onClick={item.onSelect}
          >
            {item.label}
          </DropdownItem>
        ),
      )}
    </Dropdown>
  );
}
