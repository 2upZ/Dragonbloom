---
Name: Mila
level: 5
proficiency_bonus:
hp: 24
ac: 14
speed: 30
strength: "10"
CL: Rogue
RACE: "[[Kenku]]"
ALIGN:
EXP:
CARRY:
platino: 13
oro: 8
plata: 0
electrum: 1
bronce: 0
total_bronce: 13850
gasto_platino: 0
gasto_oro: 0
gasto_plata: 0
gasto_electrum: 0
gasto_bronce: 0
equipped:
  - Dagger
  - Rapier
backpack:
  - Chain Mail
ammunition:
  - Arrow
xp_base: 1200
xp_needed: 3000
xp_gain: 0
xp_total: 470
Inspiration: false
Lvl 0 spells: Minor Illusion
Lvl 1 spells:
  - Cure Wounds
Lvl 1 slots:
Lvl 2 spells:
Lvl 2 slots:
Lvl 3 spells:
Lvl 3 slots:
Lvl 4 spells:
Lvl 4 slots:
Lvl 5 spells:
Lvl 5 slots:
Lvl 6 spells:
Lvl 6 slots:
Lvl 7 spells:
Lvl 7 slots:
Lvl 8 spells:
Lvl 8 slots:
Lvl 9 spells:
Lvl 9 slots:
SP1-1: false
---

> [!Abstract|two-columns] `= this.name`
> > [!note]
> > ````badges
> > items:
> >   - label: 
> >     value: '{{ frontmatter.CL }}'
> >   - label: Inspiration
> >     value: '{{ frontmatter.Inspiration}}'
> > ````
> > ![[Imágenes/Jugadores/Mila.jpeg]]
> > ````badges
> > items:
> >   - label: Level
> >     value: '{{ frontmatter.level }}'
> >   - label: AC
> >     value: '{{ frontmatter.ac }}'
> >   - label: Initiative
> >     value: '{{ modifier abilities.dexterity }}'
> >   - label: Speed
> >     value: '{{ frontmatter.speed }}'
> > ````
>
> > [!note]
> > ````healthpoints
> > state_key: Mila_hp
> > health: '{{ frontmatter.hp }}'
> > death_saves: true
> > hitdice:
> >   dice: d8
> >   value: 3
> > ````
>> ```dataviewjs
>> await dv.view("_dataview/scripts/encumbrance")
>> ```
>> ```dataviewjs
>> await dv.view("_dataview/scripts/xp-bar")
>> ```
>> ```meta-bind
>> INPUT[frontmatter#xp_gain]: Ganancia de XP
>> ```
>> `INPUT[number:xp_gain]` 
> > ```meta-bind-button
> > name: aplicar-xp
> > label: "APLICAR GANANCIA DE XP"
> > style: default
> > hidden: false
> > actions:
> >   - type: js
> >     file: "_dataview/scripts/applyXp.js"
> > ```

```ability
abilities:
  strength: 10
  dexterity: 18
  constitution: 12
  intelligence: 14
  wisdom: 11
  charisma: 12

proficiencies:
  - dexterity
  - intelligence

bonuses:
  - name: 
    target: 
    value: 
    modifies: 
```

```skills
proficiencies:
  - deception
  - perception
  - stealth
  - survival

expertise:
```

# Equipo y oro

```dataviewjs
await dv.view("_dataview/scripts/inventory")
```

| Moneda       | Total que tienes  | Gasto a aplicar                |
| ------------ | ----------------- | ------------------------------ |
| **Platino**  | `= this.platino`  | `INPUT[number:gasto_platino]`  |
| **Oro**      | `= this.oro`      | `INPUT[number:gasto_oro]`      |
| **Electrum** | `= this.electrum` | `INPUT[number:gasto_electrum]` |
| **Plata**    | `= this.plata`    | `INPUT[number:gasto_plata]`    |
| **Bronce**   | `= this.bronce`   | `INPUT[number:gasto_bronce]`   |
```meta-bind-button
name: aplicar-todo
label: "APLICAR TODOS LOS GASTOS"
style: default
hidden: false
actions:
  - type: js
    file: "_dataview/scripts/restarGasto.js"  # Ajusta la ruta si es necesario
```


# Spells

```stats
items:
  - label: Spellcasting Class
    value: 
  - label: Spellcasting Ability
    value: 
  - label: Spell Save DC
    value: '{{ add 8 frontmatter.proficiency_bonus (modifier abilities.intelligence) }}'
  - label: Spell Attack Bonus
    value: '+{{ add frontmatter.proficiency_bonus (modifier abilities.intelligence) }}'

grid:
  columns: 4

dense: true
```

> [!column|no-t] 
> > [!recite] Lvl 1 Spell slots
> > ```consumable
> > items:
> >  - label: " "
> >    state_key: Mila_consum
> >    uses: 2
> >    reset_on: long-rest
> > ```
> 
> > [!recite] Lvl 2 Spell slots
> > ```consumable
> > items:
> >  - label: " "
> >    state_key: Mila_consum
> >    uses: 2
> >    reset_on: long-rest
> > ```

```dataviewjs
await dv.view("_dataview/scripts/spell-list-layout")
```
